import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  private apiUrl = 'http://192.168.0.18:9090/api/materias';

  constructor(private http: HttpClient) {}

  getMaterias(token: string): Observable<any> {
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}?page=0&size=20`, { headers });
  }

}
