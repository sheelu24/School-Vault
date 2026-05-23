export type TransactionStatus = 'ISSUED' | 'RETURNED' | 'OVERDUE';

export interface Transaction {
  id: number;
  bookId: number;
  bookTitle: string;
  bookIsbn: string;
  memberId: number;
  memberName: string;
  memberEmail: string;
  issuedAt: string;
  dueDate: string;
  returnedAt?: string | null;
  status: TransactionStatus;
  fineCents: number;
}

export interface IssueRequest {
  bookId: number;
  memberId: number;
  loanDays?: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
