import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-stack',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack">
      @for (msg of toast.messages(); track msg.id) {
        <div class="alert alert-{{msg.kind}} alert-dismissible shadow-sm" role="alert">
          {{ msg.text }}
          <button type="button" class="btn-close" (click)="toast.dismiss(msg.id)" aria-label="Close"></button>
        </div>
      }
    </div>
  `
})
export class ToastStackComponent {
  protected readonly toast = inject(ToastService);
}
