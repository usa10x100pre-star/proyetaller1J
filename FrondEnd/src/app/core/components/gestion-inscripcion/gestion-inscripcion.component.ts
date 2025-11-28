import { Component, OnInit } from '@angular/core';
import { Estudiante, MapaActivo, Nivel, Progra } from '../../models/auth-response.model';
import { PrograService } from '../../servicios/progra.service';
import { NivelesService } from '../../servicios/niveles.service';
import { GeneralService } from '../../servicios/general.service';
import { AsignacionService } from '../../servicios/asignacion.service';
import { PersonalService } from '../../servicios/personal.service';
import { AuthServiceService } from '../../servicios/auth.service.service';
import { NotificationService } from '../../servicios/notification.service';
import { imprimirTablaDesdeId } from '../../utils/print-utils';
@Component({
  selector: 'app-gestion-inscripcion',
  standalone: false,
  templateUrl: './gestion-inscripcion.component.html',
  styleUrl: './gestion-inscripcion.component.css'
})
export class GestionInscripcionComponent implements OnInit {

  inscripciones: Progra[] = [];
  filtro = '';
  filtroEstado = 'ACTIVOS';
  filtroNivel = 0;

  listaNivelesActivos: Nivel[] = [];
  listaMapasActivos: MapaActivo[] = [];
  listaEstudiantesActivos: Estudiante[] = [];

  gestionActual: number = new Date().getFullYear();
  loginUsuarioActual: string = '';

  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 0;

  modalVisible = false;
  modalConfirmVisible = false;
  modoEdicion = false;
  mensajeConfirmacion = '';
  inscripcionSeleccionada: Progra | null = null;
  tipoConfirmacion: 'eliminar' | 'habilitar' = 'eliminar';

  constructor(
    private prograService: PrograService,
    private nivelesService: NivelesService,
    private generalService: GeneralService,
    private asignacionService: AsignacionService,
    private personalService: PersonalService,
    private authService: AuthServiceService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loginUsuarioActual = this.authService.getUsername() || 'admin';
    this.cargarInscripciones();
    this.cargarDatosAuxiliares();
  }

  cargarDatosAuxiliares(): void {
    this.nivelesService.listarActivos().subscribe({
      next: data => this.listaNivelesActivos = data,
      error: err => console.error('Error al cargar niveles activos:', err)
    });

    this.personalService.listarEstudiantesActivos().subscribe({
      next: data => this.listaEstudiantesActivos = data,
      error: err => console.error('Error al cargar estudiantes activos:', err)
    });

    this.generalService.getGestionActual().subscribe({
      next: data => {
        this.gestionActual = data.gestion;
        this.asignacionService.getMapasActivos(this.gestionActual).subscribe({
          next: mapas => this.listaMapasActivos = mapas,
          error: err => console.error('Error al cargar mapas activos:', err)
        });
      },
      error: err => console.error('Error al cargar gestión actual:', err)
    });
  }

  cargarInscripciones(): void {
    this.prograService
      .listarPaginado(this.filtro, this.filtroEstado, this.filtroNivel, this.paginaActual, this.itemsPorPagina)
      .subscribe({
        next: response => {
          this.inscripciones = response.content;
          this.totalPaginas = response.totalPages;
          this.paginaActual = response.number + 1;
        },
        error: err => console.error('Error al cargar inscripciones:', err)
      });
  }

  // Eventos
  onFiltroChange() {
    this.paginaActual = 1;
    this.cargarInscripciones();
  }

  onEstadoChange() {
    this.paginaActual = 1;
    this.cargarInscripciones();
  }

  cambiarPagina(page: number) {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.cargarInscripciones();
    }
  }

  // Modales
  abrirModalNuevo() {
    this.modoEdicion = false;
    this.inscripcionSeleccionada = null;
    this.modalVisible = true;
  }

  abrirModalEditar(item: Progra) {
    this.modoEdicion = true;
    this.inscripcionSeleccionada = item;
    this.modalVisible = true;
  }

  guardarInscripcion(data: { codmat: string, codpar: number, codp: number }) {
    const obs = this.modoEdicion && this.inscripcionSeleccionada
      ? this.prograService.modificar(
          this.inscripcionSeleccionada.id,
          data.codmat,
          data.codpar,
          data.codp,
          this.loginUsuarioActual
        )
      : this.prograService.crear(
          data.codmat,
          data.codpar,
          data.codp,
          this.gestionActual,
          this.loginUsuarioActual
        );

    obs.subscribe({
      next: () => {
        this.cargarInscripciones();
        this.cerrarModal();
        this.notificationService.showSuccess(
          this.modoEdicion
            ? 'Inscripción modificada correctamente'
            : 'Inscripción creada correctamente'
        );
      },
      error: (err) => {
        console.error('Error al guardar la inscripción:', err);
        // ❌ Ya no mostramos showError aquí, lo hace el ErrorInterceptor con error.error.mensaje
      }
    });
  }

  confirmarEliminar(item: Progra) {
    this.tipoConfirmacion = 'eliminar';
    this.inscripcionSeleccionada = item;
    this.mensajeConfirmacion = '¿Eliminar Inscripción?';
    this.modalConfirmVisible = true;
  }

  confirmarHabilitar(item: Progra) {
    this.tipoConfirmacion = 'habilitar';
    this.inscripcionSeleccionada = item;
    this.mensajeConfirmacion = '¿Habilitar Inscripción?';
    this.modalConfirmVisible = true;
  }

  ejecutarConfirmacion() {
    if (!this.inscripcionSeleccionada) return;
    const id = this.inscripcionSeleccionada.id;

    const obs = this.tipoConfirmacion === 'eliminar'
      ? this.prograService.eliminar(id)
      : this.prograService.habilitar(id);

    obs.subscribe({
      next: () => {
        this.cargarInscripciones();
        this.cerrarModalConfirmacion();
        this.notificationService.showSuccess(
          this.tipoConfirmacion === 'eliminar'
            ? 'Inscripción eliminada correctamente'
            : 'Inscripción habilitada correctamente'
        );
      },
      error: (err) => {
        console.error('Error al procesar la solicitud de inscripción:', err);
        // ❌ Nada de showError aquí, interceptor + GlobalExceptionHandler se encargan
      }
    });
  }

  cerrarModal() { this.modalVisible = false; }
  cerrarModalConfirmacion() { this.modalConfirmVisible = false; }
  imprimirTabla(): void {
    imprimirTablaDesdeId('tabla-inscripciones', 'Listado de Inscripciones');
  }
}
