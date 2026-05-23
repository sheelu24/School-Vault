import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Book } from '../../core/models/book.model';
import { BookService } from '../../core/services/book.service';
import { ToastService } from '../../core/services/toast.service';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="page-header">
      <h1 class="h3 mb-0">Books</h1>
      <a routerLink="/books/new" class="btn btn-primary">Add book</a>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="row g-2 mb-3">
          <div class="col-md-6">
            <input class="form-control" placeholder="Search by title, author, ISBN, or category"
                   [(ngModel)]="query" (keyup.enter)="reload(0)">
          </div>
          <div class="col-auto">
            <button class="btn btn-outline-secondary" (click)="reload(0)">Search</button>
          </div>
        </div>

        @if (loading()) {
          <div class="text-center py-4"><div class="spinner-border" role="status"></div></div>
        } @else if (books().length === 0) {
          <div class="empty-state">No books found. <a routerLink="/books/new">Add one?</a></div>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th class="text-end">Available / Total</th>
                  <th>Shelf</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (book of books(); track book.id) {
                  <tr>
                    <td><strong>{{ book.title }}</strong></td>
                    <td>{{ book.author }}</td>
                    <td><code>{{ book.isbn }}</code></td>
                    <td>{{ book.category || '—' }}</td>
                    <td class="text-end">
                      <span class="badge text-bg-{{ book.availableCopies > 0 ? 'success' : 'secondary' }}">
                        {{ book.availableCopies }}
                      </span>
                      / {{ book.totalCopies }}
                    </td>
                    <td>{{ book.shelfLocation || '—' }}</td>
                    <td class="text-end">
                      <a class="btn btn-sm btn-outline-secondary me-1" [routerLink]="['/books', book.id, 'edit']">Edit</a>
                      <button class="btn btn-sm btn-outline-danger" (click)="remove(book)">Delete</button>
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
export class BookListComponent implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly toast = inject(ToastService);

  query = '';
  readonly books = signal<Book[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  ngOnInit(): void {
    this.reload(0);
  }

  reload(page: number): void {
    this.loading.set(true);
    this.bookService.list(this.query.trim(), page).subscribe({
      next: res => {
        this.books.set(res.content);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  remove(book: Book): void {
    if (!confirm(`Delete "${book.title}"?`)) {
      return;
    }
    this.bookService.delete(book.id).subscribe({
      next: () => {
        this.toast.success(`Deleted "${book.title}"`);
        this.reload(this.page());
      }
    });
  }
}
