import { Component, OnInit } from '@angular/core';
import { DictaService } from '../../servicios/dicta.service';
import { NivelesService } from '../../servicios/niveles.service';
import { GeneralService } from '../../servicios/general.service';
import { AsignacionService } from '../../servicios/asignacion.service';
import { PersonalService } from '../../servicios/personal.service';
import { AuthServiceService } from '../../servicios/auth.service.service';
import { NotificationService } from '../../servicios/notification.service';
import { Dicta, Nivel, MapaActivo, Profesor, PageResponse } from '../../models/auth-response.model';
import { imprimirTablaDesdeId } from '../../utils/print-utils';
@Component({
  selector: 'app-gestion-asignacion-dicta',
  standalone: false,
  templateUrl: './gestion-asignacion-dicta.component.html',
  styleUrls: ['./gestion-asignacion-dicta.component.css']
})
export class GestionAsignacionDictaComponent implements OnInit {

  // --- Datos para la TABLA PRINCIPAL ---
  asignaciones: Dicta[] = [];

  // --- Datos para los FILTROS ---
  filtro = '';
  filtroEstado = 'ACTIVOS';
  filtroNivel = 0;
  listaNivelesActivos: Nivel[] = [];

  // --- Datos para el MODAL ---
  listaMapasActivos: MapaActivo[] = [];
  listaProfesoresActivos: Profesor[] = [];
  gestionActual: number = new Date().getFullYear();
  loginUsuarioActual: string = '';

  // --- Paginación ---
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 0;

  // --- Control de Modales ---
  modalVisible = false;
  modalConfirmVisible = false;
  modoEdicion = false;
  mensajeConfirmacion = '';
  asignacionSeleccionada: Dicta | null = null;
  tipoConfirmacion: 'eliminar' | 'habilitar' = 'eliminar';

  constructor(
    private dictaService: DictaService,
    private nivelesService: NivelesService,
    private generalService: GeneralService,
    private asignacionService: AsignacionService,
    private personalService: PersonalService,
    private authService: AuthServiceService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    try {
      this.loginUsuarioActual = this.authService.getUsername();
    } catch (e) {
      console.error("Error al obtener username (¿token inválido?):", e);
    }

    this.cargarAsignaciones();
    this.cargarDatosParaFiltrosYModal();
  }

  cargarDatosParaFiltrosYModal(): void {
    this.nivelesService.listarActivos().subscribe({
      next: (data) => this.listaNivelesActivos = data,
      error: (err) => console.error('Error al cargar niveles:', err)
    });

    this.generalService.getGestionActual().subscribe({
      next: (data) => {
        this.gestionActual = data.gestion;

        this.asignacionService.getMapasActivos(this.gestionActual).subscribe({
          next: (data) => this.listaMapasActivos = data,
          error: (err) => console.error('Error al cargar mapas activos:', err)
        });
      },
      error: (err) => console.error('Error al cargar gestión:', err)
    });

    this.personalService.listarProfesoresActivos().subscribe({
      next: (data) => this.listaProfesoresActivos = data,
      error: (err) => console.error('Error al cargar profesores:', err)
    });
  }

  cargarAsignaciones(): void {
    this.dictaService.listarPaginado(
      this.filtro,
      this.filtroEstado,
      this.filtroNivel,
      this.paginaActual,
      this.itemsPorPagina
    ).subscribe({
      next: (response: PageResponse<Dicta>) => {
        this.asignaciones = response.content;
        this.totalPaginas = response.totalPages;
        this.paginaActual = response.number + 1;
      },
      error: (err) => console.error('Error al cargar asignaciones:', err)
    });
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
    this.cargarAsignaciones();
  }

  onEstadoChange(): void {
    this.paginaActual = 1;
    this.cargarAsignaciones();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.cargarAsignaciones();
    }
  }

  // -----------------------
  // MODAL NUEVO / EDITAR
  // -----------------------

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.asignacionSeleccionada = null;
    this.modalVisible = true;
  }

  abrirModalEditar(asignacion: Dicta): void {
    this.modoEdicion = true;
    this.asignacionSeleccionada = asignacion;
    this.modalVisible = true;
  }

  guardarAsignacion(data: { codmat: string, codpar: number, codp: number }): void {
    if (this.modoEdicion && this.asignacionSeleccionada) {
      const idViejo = this.asignacionSeleccionada.id;

      this.dictaService.modificar(
        idViejo.codmat, idViejo.codpar, idViejo.codp, idViejo.gestion,
        data.codmat, data.codpar, data.codp,
        this.loginUsuarioActual
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess('Asignación modificada correctamente');
          this.cargarAsignaciones();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al modificar asignación:', err);
          // ❌ YA NO usamos showError aquí. El interceptor mostrará error.error.mensaje
        }
      });

    } else {
      this.dictaService.crear(
        data.codmat,
        data.codpar,
        data.codp,
        this.gestionActual,
        this.loginUsuarioActual
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess('Asignación creada correctamente');
          this.cargarAsignaciones();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al crear asignación:', err);
          // ❌ Sin showError: el ErrorInterceptor usa el mensaje del backend
        }
      });
    }
  }

  // -----------------------
  // ELIMINAR / HABILITAR
  // -----------------------

  confirmarEliminar(asignacion: Dicta): void {
    this.tipoConfirmacion = 'eliminar';
    this.asignacionSeleccionada = asignacion;
    this.mensajeConfirmacion = `¿Seguro de Eliminar esta Asignación?`;
    this.modalConfirmVisible = true;
  }

  confirmarHabilitar(asignacion: Dicta): void {
    this.tipoConfirmacion = 'habilitar';
    this.asignacionSeleccionada = asignacion;
    this.mensajeConfirmacion = `¿Seguro de Habilitar esta Asignación?`;
    this.modalConfirmVisible = true;
  }

  ejecutarConfirmacion(): void {
    if (!this.asignacionSeleccionada) return;

    const id = this.asignacionSeleccionada.id;
    const obs =
      this.tipoConfirmacion === 'eliminar'
        ? this.dictaService.eliminar(id)
        : this.dictaService.habilitar(id);

    obs.subscribe({
      next: () => {
        const accion = this.tipoConfirmacion === 'eliminar' ? 'eliminada' : 'habilitada';
        this.notificationService.showSuccess(`Asignación ${accion} correctamente`);
        this.cargarAsignaciones();
        this.cerrarModalConfirmacion();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        // ❌ Sin showError: deja que el interceptor muestre el mensaje del backend
      },
    });
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.asignacionSeleccionada = null;
  }

  cerrarModalConfirmacion(): void {
    this.modalConfirmVisible = false;
    this.asignacionSeleccionada = null;
  }
  imprimirTabla(): void {
    imprimirTablaDesdeId('tabla-asignaciones-dicta', 'Listado de Asignaciones Materia-Profesor');
  }
}
