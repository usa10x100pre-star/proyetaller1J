import { Component, OnInit } from '@angular/core';
import { ParalelosService } from '../../servicios/paralelos.service';
import { NotificationService } from '../../servicios/notification.service';
import { Paralelo, PageResponse } from '../../models/auth-response.model';
import { imprimirTablaDesdeId } from '../../utils/print-utils';
@Component({
  selector: 'app-gestion-paralelos',
  standalone: false,
  templateUrl: './gestion-paralelos.component.html',
  styleUrls: ['./gestion-paralelos.component.css']
})
export class GestionParalelosComponent implements OnInit {

  paralelos: Paralelo[] = [];

  // FILTROS
  filtro = '';
  filtroEstado = 'TODOS';

  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 0;

  // MODALES
  modalParaleloVisible = false;
  modalConfirmVisible = false;
  modoEdicion = false;

  mensajeConfirmacion = '';
  paraleloSeleccionado: Paralelo | null = null;
  tipoConfirmacion: 'eliminar' | 'habilitar' = 'eliminar';

  constructor(
    private paralelosService: ParalelosService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cargarParalelos();
  }

  /**
   * Carga la lista de paralelos desde el backend (paginada y filtrada)
   */
  cargarParalelos(): void {
    if (isNaN(this.paginaActual) || this.paginaActual < 1) {
      this.paginaActual = 1;
      console.warn('paginaActual era NaN, reseteando a 1.');
    }

    this.paralelosService.listarPaginado(
      this.filtro,
      this.filtroEstado,
      this.paginaActual,
      this.itemsPorPagina
    ).subscribe({
      next: (response: PageResponse<Paralelo>) => {
        this.paralelos = response.content;
        this.totalPaginas = response.totalPages;
        this.paginaActual = response.number + 1; // Spring es 0-based
      },
      error: (err) => {
        console.error('Error al cargar paralelos:', err);
        // 💡 El ErrorInterceptor mostrará err.error.mensaje
      }
    });
  }

  // --- Disparadores de recarga ---
  onFiltroChange(): void {
    this.paginaActual = 1;
    this.cargarParalelos();
  }

  onEstadoChange(): void {
    this.paginaActual = 1;
    this.cargarParalelos();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.cargarParalelos();
    }
  }

  // --- CRUD (Modales) ---
  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.paraleloSeleccionado = { nombre: '' };
    this.modalParaleloVisible = true;
  }

  guardarParalelo(paralelo: Paralelo): void {
     const nombre = paralelo.nombre?.trim();
    if (!nombre) {
      this.notificationService.showError('El nombre del paralelo es obligatorio.');
      return;
    }

    const existeDuplicado = this.paralelos.some(p => p.nombre?.trim().toLowerCase() === nombre.toLowerCase());
    if (existeDuplicado) {
      this.notificationService.showError('Ya existe un paralelo con ese nombre.');
      return;
    }
    this.paralelosService.crear(paralelo).subscribe({
      next: () => {
        this.notificationService.showSuccess('Paralelo creado correctamente');
        this.paginaActual = 1;
        this.filtroEstado = 'TODOS';
        this.cargarParalelos();
        this.cerrarModalParalelo();
      },
      error: (err) => {
        console.error('Error al crear paralelo:', err);
        // ❌ No mostramos éxito en error, el interceptor muestra el mensaje del backend
      }
    });
  }

  abrirModalEditar(paralelo: Paralelo): void {
    this.modoEdicion = true;
    this.paraleloSeleccionado = paralelo;
    this.modalParaleloVisible = true;
  }

  modificarParalelo(paralelo: Paralelo): void {
    if (!paralelo.codpar) return;
    this.paralelosService.modificar(paralelo.codpar, paralelo).subscribe({
      next: () => {
        this.notificationService.showSuccess('Paralelo modificado correctamente');
        this.cargarParalelos();
        this.cerrarModalParalelo();
      },
      error: (err) => {
        console.error('Error al modificar paralelo:', err);
      }
    });
  }

  confirmarEliminar(paralelo: Paralelo): void {
    this.tipoConfirmacion = 'eliminar';
    this.paraleloSeleccionado = paralelo;
    this.mensajeConfirmacion = '¿Seguro de Eliminar el Paralelo?';
    this.modalConfirmVisible = true;
  }

  confirmarHabilitar(paralelo: Paralelo): void {
    this.tipoConfirmacion = 'habilitar';
    this.paraleloSeleccionado = paralelo;
    this.mensajeConfirmacion = '¿Seguro de Habilitar el Paralelo?';
    this.modalConfirmVisible = true;
  }

  ejecutarConfirmacion(): void {
    if (!this.paraleloSeleccionado?.codpar) return;

    const id = this.paraleloSeleccionado.codpar;
    const obs =
      this.tipoConfirmacion === 'eliminar'
        ? this.paralelosService.eliminar(id)
        : this.paralelosService.habilitar(id);

    obs.subscribe({
      next: () => {
        const accion = this.tipoConfirmacion === 'eliminar' ? 'eliminado' : 'habilitado';
        this.notificationService.showSuccess(`Paralelo ${accion} correctamente`);
        this.cargarParalelos();
        this.cerrarModalConfirmacion();
      },
      error: (err) => {
        console.error('Error al actualizar estado del paralelo:', err);
      }
    });
  }

  // --- Control de Cierre de Modales ---
  cerrarModalParalelo(): void {
    this.modalParaleloVisible = false;
    this.paraleloSeleccionado = null;
  }

  cerrarModalConfirmacion(): void {
    this.modalConfirmVisible = false;
    this.paraleloSeleccionado = null;
  }
  imprimirTabla(): void {
    imprimirTablaDesdeId('tabla-paralelos', 'Listado de Paralelos');
  }
}
