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
        console.error('🔴 ERROR COMPLETO DESDE EL BACKEND:', error);

        const mensaje = this.obtenerMensaje(error);

        this.notificationService.showError(mensaje);

        return throwError(() => error);
      })
    );
  }

  /**
   * Intenta extraer el mensaje más claro posible desde la respuesta del backend.
   */
  private obtenerMensaje(error: HttpErrorResponse): string {
    // 1) Fallo de conexión, CORS o backend caído
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifique su conexión.';
    }

    // 2) Sesión expirada/no autorizada
    if (error.status === 401) {
      return 'Sesión no válida o expirada. Inicie sesión nuevamente.';
    }

    // 3) Respuestas en texto plano
    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }

    // 4) Respuestas Blob (algunos backends envían text/plain como Blob)
    if (error.error instanceof Blob) {
      if (error.error.type?.startsWith('text/')) {
        console.warn('Respuesta de error recibida como Blob de texto.');
        return 'Error recibido en formato de texto (Blob)';
      }
      console.warn('Respuesta de error recibida como Blob binario.');
      return 'Error recibido en formato binario';
    }

    // 5) JSON con estructuras comunes
    const body: any = error.error;
    if (body) {
      if (Array.isArray(body.errors) && body.errors.length > 0) {
        // Validaciones: usamos el primer mensaje
        return body.errors[0];
      }
      if (Array.isArray(body) && body.length > 0) {
        // A veces el backend devuelve un array de mensajes directamente
        return body[0];
      }
      if (body.mensaje) {
        return body.mensaje;
      }
      if (body.message) {
        return body.message;
      }
    }

    // 6) Fallback genérico
    return 'Error inesperado en el servidor';
  }
}
