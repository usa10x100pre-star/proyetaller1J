import { Component, OnInit } from '@angular/core';
import { Dmodalidad, Modalidad, PageResponse } from '../../models/auth-response.model';
import { DmodalidadService } from '../../servicios/dmodalidad.service';
import { ModalidadesService } from '../../servicios/modalidades.service';
import { NotificationService } from '../../servicios/notification.service';
import { imprimirTablaDesdeId } from '../../utils/print-utils';
@Component({
  selector: 'app-gestion-dmodalidades',
  standalone: false,
  templateUrl: './gestion-dmodalidades.component.html',
  styleUrl: './gestion-dmodalidades.component.css'
})
export class GestionDmodalidadesComponent implements OnInit {
  dmodalidades: Dmodalidad[] = [];
  modalidades: Modalidad[] = [];

  filtro = '';
  filtroEstado = 'TODOS';
  filtroModalidad: number | null = null;

  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 0;

  modalVisible = false;
  modalConfirmVisible = false;
  modoEdicion = false;

  mensajeConfirmacion = '';
  detalleSeleccionado: Dmodalidad | null = null;
  tipoConfirmacion: 'eliminar' | 'habilitar' = 'eliminar';

  constructor(
    private dmodalidadService: DmodalidadService,
    private modalidadesService: ModalidadesService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cargarModalidadesActivas();
    this.cargarDmodalidades();
  }

  cargarModalidadesActivas(): void {
    this.modalidadesService
      .listarPaginado('', 'ACTIVOS', 1, 100)
      .subscribe({
        next: (res: PageResponse<Modalidad>) => {
          this.modalidades = res.content;
        },
        error: (err) => console.error('Error al cargar modalidades:', err),
      });
  }

  cargarDmodalidades(): void {
    if (isNaN(this.paginaActual) || this.paginaActual < 1) {
      this.paginaActual = 1;
    }

    this.dmodalidadService
      .listarPaginado(
        this.filtro,
        this.filtroEstado,
        this.filtroModalidad,
        this.paginaActual,
        this.itemsPorPagina
      )
      .subscribe({
        next: (res: PageResponse<Dmodalidad>) => {
          this.dmodalidades = res.content;
          this.totalPaginas = res.totalPages;
          this.paginaActual = res.number + 1;
        },
        error: (err) => console.error('Error al cargar detalles de modalidad:', err),
      });
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
    this.cargarDmodalidades();
  }

  onEstadoChange(): void {
    this.paginaActual = 1;
    this.cargarDmodalidades();
  }

   onModalidadChange(codmod: number | null): void {
    this.filtroModalidad = codmod ?? null;
    this.paginaActual = 1;
    this.cargarDmodalidades();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.cargarDmodalidades();
    }
  }

  abrirModalNuevo(): void {
    const primeraModalidad = this.modalidades.length ? this.modalidades[0].codmod || null : null;

    this.modoEdicion = false;
    this.detalleSeleccionado = {
      coddm: '',
      nombre: '',
      modalidad: { codmod: primeraModalidad ?? 0 },
    };
    this.modalVisible = true;
  }

  abrirModalEditar(detalle: Dmodalidad): void {
    this.modoEdicion = true;
    this.detalleSeleccionado = {
      coddm: detalle.coddm,
      nombre: detalle.nombre,
      estado: detalle.estado,
      modalidad: {
        codmod: detalle.modalidad.codmod,
        nombre: detalle.modalidad.nombre,
      },
    };
    this.modalVisible = true;
  }

  guardarDetalle(detalle: Dmodalidad): void {
    this.dmodalidadService.crear(detalle).subscribe({
      next: () => {
        this.notificationService.showSuccess('Detalle de modalidad creado correctamente');
        this.paginaActual = 1;
        this.cargarDmodalidades();
        this.cerrarModal();
      },
      error: (err) => console.error('Error al crear detalle de modalidad:', err),
    });
  }

  modificarDetalle(detalle: Dmodalidad): void {
    if (!detalle.coddm) return;

    this.dmodalidadService.modificar(detalle.coddm, detalle).subscribe({
      next: () => {
        this.notificationService.showSuccess('Detalle de modalidad modificado correctamente');
        this.cargarDmodalidades();
        this.cerrarModal();
      },
      error: (err) => console.error('Error al modificar detalle de modalidad:', err),
    });
  }

  confirmarEliminar(detalle: Dmodalidad): void {
    this.tipoConfirmacion = 'eliminar';
    this.detalleSeleccionado = detalle;
    this.mensajeConfirmacion = '¿Seguro de eliminar el detalle de modalidad?';
    this.modalConfirmVisible = true;
  }

  confirmarHabilitar(detalle: Dmodalidad): void {
    this.tipoConfirmacion = 'habilitar';
    this.detalleSeleccionado = detalle;
    this.mensajeConfirmacion = '¿Seguro de habilitar el detalle de modalidad?';
    this.modalConfirmVisible = true;
  }

  ejecutarConfirmacion(): void {
    if (!this.detalleSeleccionado?.coddm) return;

    const id = this.detalleSeleccionado.coddm;
    const obs = this.tipoConfirmacion === 'eliminar'
      ? this.dmodalidadService.eliminar(id)
      : this.dmodalidadService.habilitar(id);

    obs.subscribe({
      next: () => {
        const accion = this.tipoConfirmacion === 'eliminar' ? 'eliminado' : 'habilitado';
        this.notificationService.showSuccess(`Detalle ${accion} correctamente`);
        this.cargarDmodalidades();
        this.cerrarModalConfirmacion();
      },
      error: (err) => console.error('Error al actualizar estado del detalle:', err),
    });
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.detalleSeleccionado = null;
  }

  cerrarModalConfirmacion(): void {
    this.modalConfirmVisible = false;
    this.detalleSeleccionado = null;
  }
  imprimirTabla(): void {
    imprimirTablaDesdeId('tabla-dmodalidades', 'Listado de Modalidades');
  }
}