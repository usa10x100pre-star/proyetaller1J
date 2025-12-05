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
      next: (resp: any) => {
        this.materias = resp.content;
      },
      error: () => {
        this.materias = [];
      }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/home']);
  }


refrescarMaterias(event: any) {
  this.materiasService.getMaterias(this.token).subscribe({
    next: (resp) => {
      this.materias = resp.content || resp;
      event.target.complete();
    },
    error: () => event.target.complete()
  });
}


}
