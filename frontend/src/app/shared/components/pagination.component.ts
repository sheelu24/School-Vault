import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPages > 1) {
      <nav class="d-flex justify-content-between align-items-center mt-3">
        <small class="text-muted">
          Page {{ page + 1 }} of {{ totalPages }} ({{ totalElements }} total)
        </small>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-secondary"
                  [disabled]="page <= 0"
                  (click)="emit(page - 1)">Previous</button>
          <button class="btn btn-sm btn-outline-secondary"
                  [disabled]="page >= totalPages - 1"
                  (click)="emit(page + 1)">Next</button>
        </div>
      </nav>
    }
  `
})
export class PaginationComponent {
  @Input() page = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  @Output() pageChange = new EventEmitter<number>();

  emit(p: number): void {
    if (p >= 0 && p < this.totalPages) {
      this.pageChange.emit(p);
    }
  }
}
