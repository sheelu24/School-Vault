import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ToastStackComponent } from './shared/components/toast-stack.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ToastStackComponent],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">Library</a>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/books" routerLinkActive="active">Books</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/members" routerLinkActive="active">Members</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/transactions" routerLinkActive="active">Transactions</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/transactions/issue" routerLinkActive="active">Issue / Return</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main class="app-container">
      <router-outlet></router-outlet>
    </main>
    <app-toast-stack></app-toast-stack>
  `
})
export class AppComponent {}
