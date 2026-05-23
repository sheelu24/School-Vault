import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { BookService } from '../../core/services/book.service';
import { MemberService } from '../../core/services/member.service';
import { TransactionService } from '../../core/services/transaction.service';

interface DashboardStats {
  books: number;
  members: number;
  issued: number;
  overdue: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 mb-4 bg-white rounded-3 shadow-sm">
      <h1 class="h2 mb-2">Welcome to the Library</h1>
      <p class="text-muted mb-0">
        Manage your collection, members, and book loans from a single dashboard.
      </p>
    </div>

    @if (loading()) {
      <div class="text-center py-5"><div class="spinner-border" role="status"></div></div>
    } @else {
      @if (stats(); as s) {
        <div class="row g-3">
          <div class="col-md-3">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <div class="text-muted small">Books</div>
                <div class="h3 mb-0">{{ s.books }}</div>
                <a routerLink="/books" class="small">Manage books</a>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <div class="text-muted small">Members</div>
                <div class="h3 mb-0">{{ s.members }}</div>
                <a routerLink="/members" class="small">Manage members</a>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <div class="text-muted small">Currently Issued</div>
                <div class="h3 mb-0">{{ s.issued }}</div>
                <a routerLink="/transactions" class="small">View history</a>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm h-100" [class.border-warning]="s.overdue > 0">
              <div class="card-body">
                <div class="text-muted small">Overdue</div>
                <div class="h3 mb-0" [class.text-warning]="s.overdue > 0">{{ s.overdue }}</div>
                <a routerLink="/transactions" class="small">Review</a>
              </div>
            </div>
          </div>
        </div>

        @if (isEmpty()) {
          <div class="card shadow-sm mt-4 border-primary">
            <div class="card-body">
              <h4 class="card-title">Getting started</h4>
              <p class="text-muted">
                Your library is empty. Follow these three steps to start lending books:
              </p>
              <ol class="mb-4">
                <li class="mb-2">
                  <strong>Add a few books</strong> — go to the
                  <a routerLink="/books">Books</a> tab and click
                  <em>Add book</em>. Each book needs a title, author, ISBN, and copy counts.
                </li>
                <li class="mb-2">
                  <strong>Register members</strong> — open the
                  <a routerLink="/members">Members</a> tab and click <em>Add member</em>.
                  Members need a name and a unique email.
                </li>
                <li class="mb-2">
                  <strong>Issue and return books</strong> — use the
                  <a routerLink="/transactions/issue">Issue / Return</a> screen to lend a book
                  to a member and to return it later. You can review every loan in the
                  <a routerLink="/transactions">Transactions</a> tab.
                </li>
              </ol>
              <div class="d-flex gap-2 flex-wrap">
                <a class="btn btn-primary" routerLink="/books/new">Add your first book</a>
                <a class="btn btn-outline-primary" routerLink="/members/new">Add your first member</a>
              </div>
            </div>
          </div>
        } @else {
          <div class="card shadow-sm mt-4">
            <div class="card-body">
              <h5 class="card-title">Quick actions</h5>
              <div class="d-flex gap-2 flex-wrap">
                <a class="btn btn-primary" routerLink="/books/new">Add a book</a>
                <a class="btn btn-primary" routerLink="/members/new">Add a member</a>
                <a class="btn btn-success" routerLink="/transactions/issue">Issue / return a book</a>
                <a class="btn btn-outline-secondary" routerLink="/transactions">View transaction history</a>
              </div>
            </div>
          </div>
        }

        <div class="card shadow-sm mt-4">
          <div class="card-body">
            <h5 class="card-title">How the app works</h5>
            <div class="row g-3">
              <div class="col-md-4">
                <h6 class="mb-1">Books</h6>
                <p class="small text-muted mb-0">
                  Add, edit, search, and soft-delete books. Each book tracks total and
                  available copies so the system knows what's lendable.
                </p>
              </div>
              <div class="col-md-4">
                <h6 class="mb-1">Members</h6>
                <p class="small text-muted mb-0">
                  Register members with a unique email. Deactivate members who shouldn't
                  borrow anymore — inactive members can't issue new books.
                </p>
              </div>
              <div class="col-md-4">
                <h6 class="mb-1">Issue / Return</h6>
                <p class="small text-muted mb-0">
                  Pick a book and a member to issue a loan. Returning a book restores its
                  available copy count; overdue returns accrue a fine automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    }
  `
})
export class DashboardComponent implements OnInit {
  private readonly books = inject(BookService);
  private readonly members = inject(MemberService);
  private readonly transactions = inject(TransactionService);

  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);
  readonly isEmpty = computed(() => {
    const s = this.stats();
    return !!s && s.books === 0 && s.members === 0;
  });

  ngOnInit(): void {
    forkJoin({
      books: this.books.list('', 0, 1),
      members: this.members.list('', 0, 1),
      tx: this.transactions.list({ size: 200 })
    }).subscribe({
      next: ({ books, members, tx }) => {
        const issued = tx.content.filter(t => t.status === 'ISSUED').length;
        const overdue = tx.content.filter(t => t.status === 'OVERDUE').length;
        this.stats.set({
          books: books.totalElements,
          members: members.totalElements,
          issued,
          overdue
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
