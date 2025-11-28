import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthServiceService } from './auth.service.service';
import { Modalidad, PageResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root',
})
export class ModalidadesService {
  private apiURL = `${environment.apiURL}/api/modalidades`;
  private http = inject(HttpClient);
  private authService = inject(AuthServiceService);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  listarPaginado(
    filtro: string,
    estado: string,
    page: number,
    size: number
  ): Observable<PageResponse<Modalidad>> {
    const pageZeroBased = page - 1;
    const params = new HttpParams()
      .set('filtro', filtro)
      .set('estado', estado)
      .set('page', pageZeroBased.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Modalidad>>(this.apiURL, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  crear(modalidad: Modalidad): Observable<Modalidad> {
    return this.http.post<Modalidad>(this.apiURL, modalidad, {
      headers: this.getAuthHeaders(),
    });
  }

  modificar(codmod: number, modalidad: Modalidad): Observable<Modalidad> {
    return this.http.put<Modalidad>(`${this.apiURL}/${codmod}`, modalidad, {
      headers: this.getAuthHeaders(),
    });
  }

  eliminar(codmod: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${codmod}`, {
      headers: this.getAuthHeaders(),
    });
  }

  habilitar(codmod: number): Observable<void> {
    return this.http.put<void>(`${this.apiURL}/${codmod}/habilitar`, {}, {
      headers: this.getAuthHeaders(),
    });
  }
}