import { Component, OnInit } from '@angular/core';
import {
  AsignacionService,
} from '../../servicios/asignacion.service';
import { NotificationService } from '../../servicios/notification.service';
import { Menu, PageResponse, Proceso } from '../../models/auth-response.model';

@Component({
  selector: 'app-gestion-asignacion',
  standalone: false,
  templateUrl: './gestion-asignacion.component.html',
  styleUrl: './gestion-asignacion.component.css'
})
export class GestionAsignacionComponent implements OnInit {

  // --- Estado Panel Izquierdo (Menús) ---
  menus: Menu[] = [];
  menuFiltro = '';
  paginaActualMenu = 1;
  itemsPorPaginaMenu = 10;
  totalPaginasMenu = 0;
  menuSeleccionadoCodm: number | null = null;

  // --- Estado Panel Derecho (Procesos) ---
  procesos: Proceso[] = [];
  procesoFiltro = '';
  filtroAsignado = 'TODOS'; // "TODOS", "SI", "NO"
  paginaActualProceso = 1;
  itemsPorPaginaProceso = 10;
  totalPaginasProceso = 0;

  constructor(
    private asignacionService: AsignacionService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cargarMenus();
  }

  // ============================
  // MENÚS (Panel Izquierdo)
  // ============================

  cargarMenus(): void {
    this.asignacionService
      .listarMenusPaginado(
        this.menuFiltro,
        this.paginaActualMenu,
        this.itemsPorPaginaMenu
      )
      .subscribe({
        next: (response: PageResponse<Menu>) => {
          this.menus = response.content;
          this.totalPaginasMenu = response.totalPages;
          this.paginaActualMenu = response.number + 1;
        },
        error: (err) => console.error('Error al cargar menús:', err),
      });
  }

  cambiarPaginaMenu(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginasMenu) {
      this.paginaActualMenu = nuevaPagina;
      this.cargarMenus();
    }
  }

  onMenuSelected(): void {
    this.paginaActualProceso = 1;
    this.procesoFiltro = '';
    this.filtroAsignado = 'TODOS';
    this.cargarProcesos();
  }

  // ============================
  // PROCESOS (Panel Derecho)
  // ============================

  cargarProcesos(): void {
    if (!this.menuSeleccionadoCodm) {
      this.procesos = [];
      return;
    }

    this.asignacionService
      .getProcesosParaMenu(
        this.menuSeleccionadoCodm,
        this.procesoFiltro,
        this.filtroAsignado,
        this.paginaActualProceso,
        this.itemsPorPaginaProceso
      )
      .subscribe({
        next: (response: PageResponse<Proceso>) => {
          this.procesos = response.content;
          this.totalPaginasProceso = response.totalPages;
          this.paginaActualProceso = response.number + 1;
        },
        error: (err) => console.error('Error al cargar procesos:', err),
      });
  }

  cambiarPaginaProceso(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginasProceso) {
      this.paginaActualProceso = nuevaPagina;
      this.cargarProcesos();
    }
  }

  onFiltroAsignadoChange(): void {
    this.paginaActualProceso = 1;
    this.cargarProcesos();
  }

  onProcesoToggle(proceso: Proceso, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const codm = this.menuSeleccionadoCodm;
    const codp = proceso.codp;

    if (!codm || !codp) {
      console.error('No se ha seleccionado un menú o el proceso es inválido.');
      return;
    }

    const obs = isChecked
      ? this.asignacionService.asignar(codm, codp)
      : this.asignacionService.desasignar(codm, codp);

    obs.subscribe({
      next: () => {
        proceso.asignado = isChecked;
        const accion = isChecked ? 'asignado' : 'desasignado';
        this.notificationService.showSuccess(`Proceso ${accion} correctamente`);

        if (this.filtroAsignado !== 'TODOS') {
          this.cargarProcesos();
        }
      },
      error: (err) => {
        console.error('Error al asignar/desasignar:', err);
        // ❌ YA NO mostramos mensaje aquí.
        // El ErrorInterceptor se encargará de leer err.error.mensaje
        // y mostrarlo con NotificationService.
        (event.target as HTMLInputElement).checked = !isChecked;
      },
    });
  }
}
