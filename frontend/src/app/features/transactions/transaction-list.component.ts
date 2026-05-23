import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Transaction, TransactionStatus } from '../../core/models/transaction.model';
import { TransactionService } from '../../core/services/transaction.service';
import { ToastService } from '../../core/services/toast.service';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, DatePipe, CurrencyPipe],
  template: `
    <div class="page-header">
      <h1 class="h3 mb-0">Transactions</h1>
      <a routerLink="/transactions/issue" class="btn btn-primary">Issue / return</a>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="row g-2 mb-3">
          <div class="col-md-4">
            <input class="form-control" placeholder="Book — ID, title, or ISBN"
                   [(ngModel)]="bookSearch" (keyup.enter)="reload(0)">
          </div>
          <div class="col-md-4">
            <input class="form-control" placeholder="Member — ID, name, or email"
                   [(ngModel)]="memberSearch" (keyup.enter)="reload(0)">
          </div>
          <div class="col-auto">
            <button class="btn btn-outline-secondary" (click)="reload(0)">Apply</button>
            <button class="btn btn-link" (click)="clear()">Clear</button>
          </div>
        </div>

        @if (loading()) {
          <div class="text-center py-4"><div class="spinner-border" role="status"></div></div>
        } @else if (rows().length === 0) {
          <div class="empty-state">No transactions yet.</div>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Returned</th>
                  <th>Status</th>
                  <th class="text-end">Fine</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (t of rows(); track t.id) {
                  <tr>
                    <td>{{ t.id }}</td>
                    <td>
                      <div>{{ t.bookTitle }}</div>
                      <small class="text-muted">{{ t.bookIsbn }}</small>
                    </td>
                    <td>
                      <div>{{ t.memberName }}</div>
                      <small class="text-muted">{{ t.memberEmail }}</small>
                    </td>
                    <td>{{ t.issuedAt | date:'short' }}</td>
                    <td>{{ t.dueDate | date:'short' }}</td>
                    <td>{{ t.returnedAt ? (t.returnedAt | date:'short') : '—' }}</td>
                    <td>
                      <span class="badge status-badge text-bg-{{ statusClass(t.status) }}">{{ t.status }}</span>
                    </td>
                    <td class="text-end">
                      @if (t.fineCents > 0) {
                        <span class="text-danger">{{ t.fineCents / 100 | currency }}</span>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                    <td class="text-end">
                      @if (t.status !== 'RETURNED') {
                        <button class="btn btn-sm btn-success" (click)="returnBook(t)">Return</button>
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
export class TransactionListComponent implements OnInit {
  private readonly txService = inject(TransactionService);
  private readonly toast = inject(ToastService);

  bookSearch = '';
  memberSearch = '';

  readonly rows = signal<Transaction[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  ngOnInit(): void {
    this.reload(0);
  }

  reload(page: number): void {
    this.loading.set(true);
    this.txService.list({
      bookSearch: this.bookSearch.trim() || undefined,
      memberSearch: this.memberSearch.trim() || undefined,
      page
    }).subscribe({
      next: res => {
        this.rows.set(res.content);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  clear(): void {
    this.bookSearch = '';
    this.memberSearch = '';
    this.reload(0);
  }

  returnBook(tx: Transaction): void {
    if (!confirm(`Return "${tx.bookTitle}"?`)) {
      return;
    }
    this.txService.returnBook(tx.id).subscribe({
      next: result => {
        const fineMsg = result.fineCents > 0
          ? ` (fine: $${(result.fineCents / 100).toFixed(2)})`
          : '';
        this.toast.success(`Returned "${tx.bookTitle}"${fineMsg}`);
        this.reload(this.page());
      }
    });
  }

  statusClass(status: TransactionStatus): string {
    switch (status) {
      case 'ISSUED': return 'primary';
      case 'RETURNED': return 'success';
      case 'OVERDUE': return 'warning';
      default: return 'secondary';
    }
  }
}
