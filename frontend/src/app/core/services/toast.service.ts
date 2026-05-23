import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'danger' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  text: string;
  kind: ToastKind;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly messages = signal<ToastMessage[]>([]);

  show(text: string, kind: ToastKind = 'info', ttlMs = 4000): void {
    const msg: ToastMessage = { id: this.nextId++, text, kind };
    this.messages.update(list => [...list, msg]);
    setTimeout(() => this.dismiss(msg.id), ttlMs);
  }

  success(text: string): void { this.show(text, 'success'); }
  error(text: string): void { this.show(text, 'danger', 6000); }
  info(text: string): void { this.show(text, 'info'); }

  dismiss(id: number): void {
    this.messages.update(list => list.filter(m => m.id !== id));
  }
}
