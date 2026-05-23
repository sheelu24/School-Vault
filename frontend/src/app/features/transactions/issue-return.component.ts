import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Book } from '../../core/models/book.model';
import { Member } from '../../core/models/member.model';
import { Transaction } from '../../core/models/transaction.model';
import { BookService } from '../../core/services/book.service';
import { MemberService } from '../../core/services/member.service';
import { TransactionService } from '../../core/services/transaction.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-issue-return',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe],
  template: `
    <div class="page-header">
      <h1 class="h3 mb-0">Issue / Return</h1>
      <a routerLink="/transactions" class="btn btn-outline-secondary">View history</a>
    </div>

    <div class="row g-3">
      <div class="col-lg-5">
        <div class="card shadow-sm">
          <div class="card-header"><strong>Issue a book</strong></div>
          <div class="card-body">
            <form [formGroup]="form" (ngSubmit)="issue()">
              <div class="mb-3">
                <label class="form-label">Book *</label>
                <select class="form-select" formControlName="bookId">
                  <option [ngValue]="null" disabled>— select a book —</option>
                  @for (b of books(); track b.id) {
                    <option [ngValue]="b.id" [disabled]="b.availableCopies <= 0">
                      {{ b.title }} ({{ b.isbn }}) — {{ b.availableCopies }} available
                    </option>
                  }
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Member *</label>
                <select class="form-select" formControlName="memberId">
                  <option [ngValue]="null" disabled>— select a member —</option>
                  @for (m of activeMembers(); track m.id) {
                    <option [ngValue]="m.id">{{ m.name }} ({{ m.email }})</option>
                  }
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Loan days</label>
                <input type="number" min="1" class="form-control" formControlName="loanDays">
                <small class="text-muted">Defaults to 14 days if blank.</small>
              </div>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || submitting()">
                {{ submitting() ? 'Issuing…' : 'Issue book' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-7">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <strong>Currently issued</strong>
            <button class="btn btn-sm btn-outline-secondary" (click)="loadOpen()">Refresh</button>
          </div>
          <div class="card-body p-0">
            @if (loadingOpen()) {
              <div class="text-center py-4"><div class="spinner-border" role="status"></div></div>
            } @else if (open().length === 0) {
              <div class="empty-state">Nothing is currently out on loan.</div>
            } @else {
              <div class="table-responsive">
                <table class="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Member</th>
                      <th>Due</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (t of open(); track t.id) {
                      <tr>
                        <td>{{ t.bookTitle }}</td>
                        <td>{{ t.memberName }}</td>
                        <td>{{ t.dueDate | date:'short' }}</td>
                        <td>
                          <span class="badge text-bg-{{ t.status === 'OVERDUE' ? 'warning' : 'primary' }}">
                            {{ t.status }}
                          </span>
                        </td>
                        <td class="text-end">
                          <button class="btn btn-sm btn-success" (click)="returnBook(t)">Return</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class IssueReturnComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bookService = inject(BookService);
  private readonly memberService = inject(MemberService);
  private readonly txService = inject(TransactionService);
  private readonly toast = inject(ToastService);

  readonly books = signal<Book[]>([]);
  readonly activeMembers = signal<Member[]>([]);
  readonly open = signal<Transaction[]>([]);
  readonly loadingOpen = signal(false);
  readonly submitting = signal(false);

  form = this.fb.group({
    bookId: this.fb.control<number | null>(null, Validators.required),
    memberId: this.fb.control<number | null>(null, Validators.required),
    loanDays: this.fb.control<number | null>(14)
  });

  ngOnInit(): void {
    this.bookService.list('', 0, 200).subscribe(res => this.books.set(res.content));
    this.memberService.list('', 0, 200).subscribe(res =>
      this.activeMembers.set(res.content.filter(m => m.status === 'ACTIVE'))
    );
    this.loadOpen();
  }

  loadOpen(): void {
    this.loadingOpen.set(true);
    this.txService.list({ size: 100 }).subscribe({
      next: res => {
        this.open.set(res.content.filter(t => t.status !== 'RETURNED'));
        this.loadingOpen.set(false);
      },
      error: () => this.loadingOpen.set(false)
    });
  }

  issue(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.txService.issue({
      bookId: v.bookId!,
      memberId: v.memberId!,
      loanDays: v.loanDays ?? undefined
    }).subscribe({
      next: tx => {
        this.toast.success(`Issued "${tx.bookTitle}" to ${tx.memberName}`);
        this.submitting.set(false);
        this.form.reset({ bookId: null, memberId: null, loanDays: 14 });
        this.bookService.list('', 0, 200).subscribe(res => this.books.set(res.content));
        this.loadOpen();
      },
      error: () => this.submitting.set(false)
    });
  }

  returnBook(tx: Transaction): void {
    this.txService.returnBook(tx.id).subscribe({
      next: () => {
        this.toast.success(`Returned "${tx.bookTitle}"`);
        this.bookService.list('', 0, 200).subscribe(res => this.books.set(res.content));
        this.loadOpen();
      }
    });
  }
}
