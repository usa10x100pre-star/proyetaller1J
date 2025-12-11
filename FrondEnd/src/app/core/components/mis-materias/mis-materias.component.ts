import { Component, OnInit } from '@angular/core';
import { Progra } from '../../models/auth-response.model';
import { PrograService } from '../../servicios/progra.service';
import { AuthServiceService } from '../../servicios/auth.service.service';
import { NotificationService } from '../../servicios/notification.service';

@Component({
  selector: 'app-mis-materias',
  standalone: false,
  templateUrl: './mis-materias.component.html',
  styleUrl: './mis-materias.component.css'
})
export class MisMateriasComponent implements OnInit {

  materiasInscritas: Progra[] = [];
  estaCargando = true;

  constructor(
    private prograService: PrograService,
    private authService: AuthServiceService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    const login = this.authService.getUsername();

    if (!login) {
      this.estaCargando = false;
      this.notificationService.showError('No se pudo identificar al estudiante. Inicie sesión nuevamente.');
      return;
    }

    this.prograService.listarPorAlumno(login).subscribe({
      next: (data) => {
        this.materiasInscritas = data;
        this.estaCargando = false;
      },
      error: (err) => {
        console.error('Error al obtener materias del estudiante', err);
        this.notificationService.showError('No se pudieron cargar las materias inscritas.');
        this.estaCargando = false;
      }
    });
  }
}