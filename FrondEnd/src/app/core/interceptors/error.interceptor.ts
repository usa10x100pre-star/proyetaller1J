import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../servicios/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        console.error("🔴 ERROR COMPLETO DESDE EL BACKEND:", error);

        let backendMessage = error.error?.mensaje;

        // Si existe mensaje del backend → mostrarlo
        if (backendMessage) {
          this.notificationService.showError(backendMessage);

        } else {
          // Error inesperado
          this.notificationService.showError('Error inesperado en el servidor');
        }

        return throwError(() => error);
      })
    );
  }
}
