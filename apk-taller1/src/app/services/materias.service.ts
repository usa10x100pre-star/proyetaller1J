import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class MateriasService {

   private apiUrl = 'http://192.168.0.18:9090/api/progra/alumno';

  constructor(private http: HttpClient) {}

    getMaterias(token: string, login: string): Observable<any[]> {
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${token}`
    });

      return this.http.get(`${this.apiUrl}/${login}`, { headers }).pipe(
      map((resp: any) => {
        const inscripciones = resp?.content ?? resp;

        if (!Array.isArray(inscripciones) || inscripciones.length === 0) {
          throw new Error('El estudiante no tiene materias asignadas');
        }

         return inscripciones.map((inscripcion: any) => inscripcion.materia);
      })
    );
  }

}
