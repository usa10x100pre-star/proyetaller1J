import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthServiceService } from './auth.service.service';
import { Dmodalidad, PageResponse } from '../models/auth-response.model';

@Injectable({ providedIn: 'root' })
export class DmodalidadService {
  private apiURL = `${environment.apiURL}/api/dmodalidades`;
  private http = inject(HttpClient);
  private authService = inject(AuthServiceService);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  listarPaginado(
    filtro: string,
    estado: string,
    codmod: number | null,
    page: number,
    size: number
  ): Observable<PageResponse<Dmodalidad>> {
    const pageZeroBased = page - 1;
    let params = new HttpParams()
      .set('filtro', filtro)
      .set('estado', estado)
      .set('page', pageZeroBased.toString())
      .set('size', size.toString());

    if (codmod !== null) {
      params = params.set('codmod', codmod.toString());
    }

    return this.http.get<PageResponse<Dmodalidad>>(this.apiURL, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  crear(detalle: Dmodalidad): Observable<Dmodalidad> {
    return this.http.post<Dmodalidad>(this.apiURL, detalle, {
      headers: this.getAuthHeaders(),
    });
  }

  modificar(coddm: string, detalle: Dmodalidad): Observable<Dmodalidad> {
    return this.http.put<Dmodalidad>(`${this.apiURL}/${coddm}`, detalle, {
      headers: this.getAuthHeaders(),
    });
  }

  eliminar(coddm: string): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${coddm}`, {
      headers: this.getAuthHeaders(),
    });
  }

  habilitar(coddm: string): Observable<void> {
    return this.http.put<void>(`${this.apiURL}/${coddm}/habilitar`, {}, {
      headers: this.getAuthHeaders(),
    });
  }
}