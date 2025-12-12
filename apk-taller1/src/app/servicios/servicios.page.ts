import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MateriasService } from '../services/materias.service';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone: false,
})
export class ServiciosPage implements OnInit {
  token: string = "";
  materias: any[] = [];
  mensajeEstado: string = '';
  errorMsg: string = '';

  constructor(
    private materiasService: MateriasService,
    private router: Router
  ) {}

 ngOnInit() {
    this.token = localStorage.getItem("token") || "";
    this.cargarMaterias();
  }

  cargarMaterias() {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/home']);
      return;
    }

    this.materiasService.getMaterias(token).subscribe({
      next: (materias) => {
        this.materias = materias;
        this.mensajeEstado = this.construirMensajeMaterias(materias);
        this.errorMsg = '';
      },
      error: (err: any) => {
        this.materias = [];
          this.errorMsg = err?.message || 'No se pudieron cargar las materias del estudiante.';
        this.mensajeEstado = '';
      }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/home']);
  }

 refrescarMaterias(event: any) {
    this.materiasService.getMaterias(this.token).subscribe({
      next: (materias) => {
        this.materias = materias;
        this.mensajeEstado = this.construirMensajeMaterias(materias);
        this.errorMsg = '';
        event.target.complete();
      },
      error: (err: any) => {
        this.materias = [];
        this.errorMsg = err?.message || 'No se pudieron cargar las materias del estudiante.';
        this.mensajeEstado = '';
        event.target.complete();
      }
    });
  }
 private construirMensajeMaterias(materias: any[]): string {
    if (!materias || materias.length === 0) {
      return '';
    }

    const listaMaterias = materias.map((m) => m.nombre).join(', ');
    return `Estás programado en: ${listaMaterias}`;
  }


}
