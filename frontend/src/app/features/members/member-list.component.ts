import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Member } from '../../core/models/member.model';
import { MemberService } from '../../core/services/member.service';
import { ToastService } from '../../core/services/toast.service';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="page-header">
      <h1 class="h3 mb-0">Members</h1>
      <a routerLink="/members/new" class="btn btn-primary">Add member</a>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="row g-2 mb-3">
          <div class="col-md-6">
            <input class="form-control" placeholder="Search by name or email"
                   [(ngModel)]="query" (keyup.enter)="reload(0)">
          </div>
          <div class="col-auto">
            <button class="btn btn-outline-secondary" (click)="reload(0)">Search</button>
          </div>
        </div>

        @if (loading()) {
          <div class="text-center py-4"><div class="spinner-border" role="status"></div></div>
        } @else if (members().length === 0) {
          <div class="empty-state">No members found.</div>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (m of members(); track m.id) {
                  <tr>
                    <td><strong>{{ m.name }}</strong></td>
                    <td>{{ m.email }}</td>
                    <td>{{ m.phone || '—' }}</td>
                    <td>
                      <span class="badge status-badge text-bg-{{ m.status === 'ACTIVE' ? 'success' : 'secondary' }}">
                        {{ m.status }}
                      </span>
                    </td>
                    <td class="text-end">
                      <a class="btn btn-sm btn-outline-secondary me-1" [routerLink]="['/members', m.id, 'edit']">Edit</a>
                      @if (m.status === 'ACTIVE') {
                        <button class="btn btn-sm btn-outline-warning" (click)="deactivate(m)">Deactivate</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <app-pagination
            [page]="page()"
            [totalPages]="totalPages()"
            [totalElements]="totalElements()"
            (pageChange)="reload($event)"></app-pagination>
        }
      </div>
    </div>
  `
})
export class MemberListComponent implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly toast = inject(ToastService);

  query = '';
  readonly members = signal<Member[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  ngOnInit(): void {
    this.reload(0);
  }

  reload(page: number): void {
    this.loading.set(true);
    this.memberService.list(this.query.trim(), page).subscribe({
      next: res => {
        this.members.set(res.content);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  deactivate(member: Member): void {
    if (!confirm(`Deactivate ${member.name}?`)) {
      return;
    }
    this.memberService.deactivate(member.id).subscribe({
      next: () => {
        this.toast.success(`${member.name} deactivated`);
        this.reload(this.page());
      }
    });
  }
}
