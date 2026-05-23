import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MemberService } from '../../core/services/member.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h1 class="h3 mb-0">{{ id() ? 'Edit member' : 'Add member' }}</h1>
      <a routerLink="/members" class="btn btn-outline-secondary">Back</a>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Name *</label>
              <input class="form-control" formControlName="name">
              @if (showError('name')) {
                <div class="form-error">Name is required</div>
              }
            </div>
            <div class="col-md-6">
              <label class="form-label">Email *</label>
              <input type="email" class="form-control" formControlName="email">
              @if (showError('email')) {
                <div class="form-error">A valid email is required</div>
              }
            </div>
            <div class="col-md-6">
              <label class="form-label">Phone</label>
              <input class="form-control" formControlName="phone">
            </div>
            <div class="col-md-6">
              <label class="form-label">Status</label>
              <select class="form-select" formControlName="status">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div class="mt-4 d-flex gap-2">
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || submitting()">
              {{ submitting() ? 'Saving…' : (id() ? 'Update member' : 'Create member') }}
            </button>
            <a routerLink="/members" class="btn btn-outline-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class MemberFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly memberService = inject(MemberService);
  private readonly toast = inject(ToastService);

  readonly id = signal<number | null>(null);
  readonly submitting = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: [''],
    status: ['ACTIVE' as 'ACTIVE' | 'INACTIVE']
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.id.set(id);
      this.memberService.get(id).subscribe(member => {
        this.form.patchValue({
          name: member.name,
          email: member.email,
          phone: member.phone ?? '',
          status: member.status
        });
      });
    }
  }

  showError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    const req = {
      name: value.name,
      email: value.email,
      phone: value.phone || undefined,
      status: value.status
    };
    const id = this.id();
    const op$ = id ? this.memberService.update(id, req) : this.memberService.create(req);
    op$.subscribe({
      next: () => {
        this.toast.success(`Member ${id ? 'updated' : 'created'}`);
        this.router.navigate(['/members']);
      },
      error: () => this.submitting.set(false)
    });
  }
}
