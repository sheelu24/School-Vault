import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'books',
    loadComponent: () =>
      import('./features/books/book-list.component').then(m => m.BookListComponent)
  },
  {
    path: 'books/new',
    loadComponent: () =>
      import('./features/books/book-form.component').then(m => m.BookFormComponent)
  },
  {
    path: 'books/:id/edit',
    loadComponent: () =>
      import('./features/books/book-form.component').then(m => m.BookFormComponent)
  },
  {
    path: 'members',
    loadComponent: () =>
      import('./features/members/member-list.component').then(m => m.MemberListComponent)
  },
  {
    path: 'members/new',
    loadComponent: () =>
      import('./features/members/member-form.component').then(m => m.MemberFormComponent)
  },
  {
    path: 'members/:id/edit',
    loadComponent: () =>
      import('./features/members/member-form.component').then(m => m.MemberFormComponent)
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/transactions/transaction-list.component').then(m => m.TransactionListComponent)
  },
  {
    path: 'transactions/issue',
    loadComponent: () =>
      import('./features/transactions/issue-return.component').then(m => m.IssueReturnComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
