import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IssueRequest, PageResponse, Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/v1/transactions`;

  list(opts: { bookSearch?: string; memberSearch?: string; page?: number; size?: number } = {}):
    Observable<PageResponse<Transaction>> {
    let params = new HttpParams()
      .set('page', opts.page ?? 0)
      .set('size', opts.size ?? 20);
    if (opts.bookSearch) {
      params = params.set('bookSearch', opts.bookSearch);
    }
    if (opts.memberSearch) {
      params = params.set('memberSearch', opts.memberSearch);
    }
    return this.http.get<PageResponse<Transaction>>(this.base, { params });
  }

  issue(req: IssueRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.base}/issue`, req);
  }

  returnBook(id: number): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.base}/${id}/return`, {});
  }
}
