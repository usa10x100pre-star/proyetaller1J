import { Component, OnInit } from '@angular/core';

import { NotificationService } from '../../servicios/notification.service';
import { Modalidad, PageResponse } from '../../models/auth-response.model';
import { ModalidadesService } from '../../servicios/modalidades.service';
import { imprimirTablaDesdeId } from '../../utils/print-utils';
@Component({
  selector: 'app-gestion-modalidades',
  standalone: false,
  templateUrl: './gestion-modalidades.component.html',
  styleUrls: ['./gestion-modalidades.component.css']
})
export class GestionModalidadesComponent implements OnInit {
  modalidades: Modalidad[] = [];

  filtro = '';
  filtroEstado = 'TODOS';

  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 0;

  modalModalidadVisible = false;
  modalConfirmVisible = false;
  modoEdicion = false;

  mensajeConfirmacion = '';
  modalidadSeleccionada: Modalidad | null = null;
  tipoConfirmacion: 'eliminar' | 'habilitar' = 'eliminar';

  constructor(
    private modalidadesService: ModalidadesService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cargarModalidades();
  }

  cargarModalidades(): void {
    this.modalidadesService.listarPaginado(
      this.filtro,
      this.filtroEstado,
      this.paginaActual,
      this.itemsPorPagina
    ).subscribe({
      next: (response: PageResponse<Modalidad>) => {
        this.modalidades = response.content;
        this.totalPaginas = response.totalPages;
        this.paginaActual = response.number + 1;
      },
      error: (err) => {
        console.error('Error al cargar modalidades:', err);
      }
    });
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
    this.cargarModalidades();
  }

  onEstadoChange(): void {
    this.paginaActual = 1;
    this.cargarModalidades();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.cargarModalidades();
    }
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.modalidadSeleccionada = { nombre: '' };
    this.modalModalidadVisible = true;
  }

  guardarModalidad(modalidad: Modalidad): void {
    this.modalidadesService.crear(modalidad).subscribe({
      next: () => {
        this.notificationService.showSuccess('Modalidad creada correctamente');
        this.cargarModalidades();
        this.cerrarModalModalidad();
      },
      error: (err) => {
        console.error('Error al crear modalidad:', err);
      }
    });
  }

  abrirModalEditar(modalidad: Modalidad): void {
    this.modoEdicion = true;
    this.modalidadSeleccionada = { ...modalidad };
    this.modalModalidadVisible = true;
  }

  modificarModalidad(modalidad: Modalidad): void {
    if (!modalidad.codmod) return;
    this.modalidadesService.modificar(modalidad.codmod, modalidad).subscribe({
      next: () => {
        this.notificationService.showSuccess('Modalidad modificada correctamente');
        this.cargarModalidades();
        this.cerrarModalModalidad();
      },
      error: (err) => {
        console.error('Error al modificar modalidad:', err);
      }
    });
  }

  confirmarEliminar(modalidad: Modalidad): void {
    this.tipoConfirmacion = 'eliminar';
    this.modalidadSeleccionada = modalidad;
    this.mensajeConfirmacion = '¿Seguro de eliminar Modalidad?';
    this.modalConfirmVisible = true;
  }

  confirmarHabilitar(modalidad: Modalidad): void {
    this.tipoConfirmacion = 'habilitar';
    this.modalidadSeleccionada = modalidad;
    this.mensajeConfirmacion = '¿Seguro de habilitar Modalidad?';
    this.modalConfirmVisible = true;
  }

  ejecutarConfirmacion(): void {
    if (!this.modalidadSeleccionada?.codmod) return;

    const id = this.modalidadSeleccionada.codmod;
    const obs =
      this.tipoConfirmacion === 'eliminar'
        ? this.modalidadesService.eliminar(id)
        : this.modalidadesService.habilitar(id);

    obs.subscribe({
      next: () => {
        const accion = this.tipoConfirmacion === 'eliminar' ? 'eliminada' : 'habilitada';
        this.notificationService.showSuccess(`Modalidad ${accion} correctamente`);
        this.cargarModalidades();
        this.cerrarModalConfirmacion();
      },
      error: (err) => {
        console.error('Error al actualizar estado de la modalidad:', err);
      },
    });
  }

  cerrarModalModalidad(): void {
    this.modalModalidadVisible = false;
    this.modalidadSeleccionada = null;
  }

  cerrarModalConfirmacion(): void {
    this.modalConfirmVisible = false;
    this.modalidadSeleccionada = null;
  }
  imprimirTabla(): void {
    imprimirTablaDesdeId('tabla-modalidades', 'Listado de Modalidades');
  }
}