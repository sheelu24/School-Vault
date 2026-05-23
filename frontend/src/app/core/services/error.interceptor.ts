import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ToastService } from './toast.service';

interface ApiError {
  message?: string;
  fieldErrors?: { field: string; message: string }[];
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const body = err.error as ApiError | null;
      const fieldMsg = body?.fieldErrors?.map(f => `${f.field}: ${f.message}`).join('; ');
      const message =
        fieldMsg && fieldMsg.length > 0
          ? fieldMsg
          : body?.message ?? `Request failed (${err.status})`;
      toast.error(message);
      return throwError(() => err);
    })
  );
};
