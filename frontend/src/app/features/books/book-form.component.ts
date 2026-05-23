import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { BookService } from '../../core/services/book.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h1 class="h3 mb-0">{{ id() ? 'Edit book' : 'Add book' }}</h1>
      <a routerLink="/books" class="btn btn-outline-secondary">Back</a>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Title *</label>
              <input class="form-control" formControlName="title">
              @if (showError('title')) {
                <div class="form-error">Title is required</div>
              }
            </div>
            <div class="col-md-6">
              <label class="form-label">Author *</label>
              <input class="form-control" formControlName="author">
              @if (showError('author')) {
                <div class="form-error">Author is required</div>
              }
            </div>
            <div class="col-md-6">
              <label class="form-label">ISBN *</label>
              <input class="form-control" formControlName="isbn">
              @if (showError('isbn')) {
                <div class="form-error">ISBN is required</div>
              }
            </div>
            <div class="col-md-6">
              <label class="form-label">Category</label>
              <input class="form-control" formControlName="category">
            </div>
            <div class="col-md-3">
              <label class="form-label">Total copies</label>
              <input type="number" min="0" class="form-control" formControlName="totalCopies">
              @if (showError('totalCopies')) {
                <div class="form-error">Must be >= 0</div>
              }
            </div>
            <div class="col-md-3">
              <label class="form-label">Available copies</label>
              <input type="number" min="0" class="form-control" formControlName="availableCopies">
              @if (showError('availableCopies')) {
                <div class="form-error">Must be >= 0</div>
              }
            </div>
            <div class="col-md-6">
              <label class="form-label">Shelf location</label>
              <input class="form-control" formControlName="shelfLocation">
            </div>
          </div>

          <div class="mt-4 d-flex gap-2">
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || submitting()">
              {{ submitting() ? 'Saving…' : (id() ? 'Update book' : 'Create book') }}
            </button>
            <a routerLink="/books" class="btn btn-outline-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class BookFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookService = inject(BookService);
  private readonly toast = inject(ToastService);

  readonly id = signal<number | null>(null);
  readonly submitting = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    author: ['', [Validators.required, Validators.maxLength(255)]],
    isbn: ['', [Validators.required, Validators.maxLength(32)]],
    category: [''],
    totalCopies: [0, [Validators.required, Validators.min(0)]],
    availableCopies: [0, [Validators.required, Validators.min(0)]],
    shelfLocation: ['']
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.id.set(id);
      this.bookService.get(id).subscribe(book => {
        this.form.patchValue({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          category: book.category ?? '',
          totalCopies: book.totalCopies,
          availableCopies: book.availableCopies,
          shelfLocation: book.shelfLocation ?? ''
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
      ...value,
      category: value.category || undefined,
      shelfLocation: value.shelfLocation || undefined
    };
    const id = this.id();
    const op$ = id ? this.bookService.update(id, req) : this.bookService.create(req);
    op$.subscribe({
      next: () => {
        this.toast.success(`Book ${id ? 'updated' : 'created'}`);
        this.router.navigate(['/books']);
      },
      error: () => this.submitting.set(false)
    });
  }
}
