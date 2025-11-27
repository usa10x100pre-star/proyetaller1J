import { Component, OnInit } from '@angular/core';
import { PersonalService, Personal } from '../../servicios/personal.service';
import { NotificationService } from '../../servicios/notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: false,
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css'],
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: Personal[] = [];
  //FILTROS
  filtro = '';
  filtroEstado = 'TODOS';
  filtroTipo = '';

  // control de modales
  modalPersonaVisible = false;
  modalConfirmVisible = false;
  apiURL = environment.apiURL;

  modoEdicion = false;
  tipoConfirmacion: 'eliminar' | 'habilitar' = 'eliminar';
  mensajeConfirmacion = '';
  personaSeleccionada: Personal | null = null;

  nuevaPersona: Personal = this.resetPersona();
  nuevaFoto: File | null = null;

  // PAGINACIÓN

  paginaActual = 1;
  itemsPorPagina = 8;

  get totalPaginas(): number {
    return Math.ceil(this.filtrar().length / this.itemsPorPagina);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  get datosPaginados(): Personal[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.filtrar().slice(inicio, inicio + this.itemsPorPagina);
  }

  constructor(
    private personalService: PersonalService,
    private notificationService: NotificationService
  ) { }

  /**
   * Muestra un error amigable usando el mensaje del backend si está disponible.
   */
  private manejarError(err: any, mensajePorDefecto: string): void {
    const mensaje = err?.error?.mensaje || err?.message || mensajePorDefecto;
    this.notificationService.showError(mensaje);
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }


  //  Listar personal

  cargarUsuarios(): void {
    this.personalService.listar().subscribe({
      next: (data) => {
        this.usuarios = data.map(p => ({ ...p, tieneClave: p['tieneClave'] ?? false }));
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.manejarError(err, 'Error al cargar usuarios');
      }
    });
  }

  filtrar(): Personal[] {
    const f = this.filtro.toLowerCase();
    return this.usuarios.filter(
      (u) =>
        (`${u.nombre} ${u.ap} ${u.am ?? ''}`.toLowerCase().includes(f)) &&
        (this.filtroEstado === 'TODOS' ||
          (this.filtroEstado === 'ACTIVOS' && u.estado === 1) ||
          (this.filtroEstado === 'BAJAS' && u.estado === 0)) &&
        (this.filtroTipo === '' || u.tipo === this.filtroTipo)
    );
  }


  // nueva persona

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.nuevaPersona = this.resetPersona();
    this.nuevaFoto = null;
    this.modalPersonaVisible = true;
  }

  guardarPersona(): void {
    // primero guarda la persona en PERSONAL
    this.personalService.crear(this.nuevaPersona, this.nuevaFoto!).subscribe({
      next: (personaGuardada) => {

        if (this.nuevaPersona.cedula && this.nuevaPersona.cedula.trim() !== '') {
          this.personalService.registrarEnDatos(personaGuardada.codp!, this.nuevaPersona.cedula).subscribe({
            next: () => {
              this.notificationService.showSuccess('Persona creada correctamente');
              this.cargarUsuarios();
              this.modalPersonaVisible = false;
            },
            error: (err) => {
              console.error('Error al guardar en DATOS:', err);
              this.manejarError(err, 'Error al guardar datos complementarios');
            },
          });
        } else {
          this.notificationService.showSuccess('Persona creada correctamente');
          this.cargarUsuarios();
          this.modalPersonaVisible = false;
        }
      },
      error: (err) => {
        console.error('Error al guardar persona:', err);
        this.manejarError(err, 'Error al crear persona');
      },
    });
  }


  //modificar datos de la persona

  abrirModalEditar(p: Personal): void {
    this.modoEdicion = true;
    this.nuevaPersona = { ...p };
    this.modalPersonaVisible = true;
  }

  modificarPersona(): void {
    if (!this.nuevaPersona.codp) return;
    this.personalService
      .modificar(this.nuevaPersona.codp, this.nuevaPersona, this.nuevaFoto!)
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Persona modificada correctamente');
          this.cargarUsuarios();
          this.modalPersonaVisible = false;
        },
        error: (err) => {
          console.error('Error al modificar persona:', err);
          this.manejarError(err, 'Error al modificar persona');
        },
      });
  }

  //elimina y habilita
  alternarEstado(u: Personal): void {
    if (!u.codp) return;
    if (u.estado === 1) this.confirmarEliminar(u);
    else this.confirmarHabilitar(u);
  }

  confirmarEliminar(p: Personal): void {
    this.tipoConfirmacion = 'eliminar';
    this.personaSeleccionada = p;
    this.mensajeConfirmacion = '¿Seguro de eliminar los datos de la persona?';
    this.modalConfirmVisible = true;
  }

  confirmarHabilitar(p: Personal): void {
    this.tipoConfirmacion = 'habilitar';
    this.personaSeleccionada = p;
    this.mensajeConfirmacion = '¿Seguro de habilitar a la persona?';
    this.modalConfirmVisible = true;
  }

  ejecutarConfirmacion(): void {
    if (!this.personaSeleccionada?.codp) return;

    const id = this.personaSeleccionada.codp;
    const obs =
      this.tipoConfirmacion === 'eliminar'
        ? this.personalService.eliminar(id)
        : this.personalService.habilitar(id);

    obs.subscribe({
      next: () => {
        const accion = this.tipoConfirmacion === 'eliminar' ? 'eliminada' : 'habilitada';
        this.notificationService.showSuccess(`Persona ${accion} correctamente`);
        this.cargarUsuarios();
        this.modalConfirmVisible = false;
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        this.manejarError(err, 'Error al actualizar estado');
      },
    });
  }


  imprimirUsuarios(): void {
    window.print();
  }

  cerrarModalPersona(): void {
    this.modalPersonaVisible = false;
  }

  cerrarModalConfirmacion(): void {
    this.modalConfirmVisible = false;
  }

  onFileSelected(file: File): void {
    if (file) {
      this.nuevaFoto = file;
      console.log("📸 Archivo recibido desde modal:", file.name);
    }
  }



  private resetPersona(): Personal {
    return {
      nombre: '',
      ap: '',
      am: '',
      genero: 'M',
      tipo: '',
      ecivil: 'S',
      estado: 1,
    };
  }
  // Modal de acceso
  modalAccesoVisible = false;
  modoAccesoEdicion = false;
  personaAcceso: Personal | null = null;
  nuevoAcceso = { login: '', password: '', repetir: '' };

  abrirModalAcceso(persona: Personal, edicion: boolean): void {
    this.personaAcceso = persona;
    this.modoAccesoEdicion = edicion;
    this.nuevoAcceso = { login: '', password: '', repetir: '' };
    this.modalAccesoVisible = true;
  }

  cerrarModalAcceso(): void {
    this.modalAccesoVisible = false;
  }

  // Guardar acceso (crear o modificar)
  guardarAcceso(): void {
    if (!this.personaAcceso?.codp) return;
    if (this.nuevoAcceso.password !== this.nuevoAcceso.repetir) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const usuario = {
      login: this.nuevoAcceso.login,
      password: this.nuevoAcceso.password,
      estado: 1,
      personal: { codp: this.personaAcceso.codp },
    };

    if (this.modoAccesoEdicion) {
      // editar acceso existente
      this.personalService.modificarUsuario(usuario.login, usuario).subscribe({
        next: () => {
          this.notificationService.showSuccess('Acceso modificado correctamente');
          this.cargarUsuarios();
          this.modalAccesoVisible = false;
        },
        error: (err) => {
          console.error('Error al modificar acceso:', err);
          this.manejarError(err, 'Error al modificar acceso');
        },
      });
    } else {
      // crear nuevo acceso
      this.personalService.crearUsuario(usuario).subscribe({
        next: () => {
          this.notificationService.showSuccess('Acceso creado correctamente');
          this.cargarUsuarios();
          this.modalAccesoVisible = false;
        },
        error: (err) => {
          console.error('Error al crear acceso:', err);
          this.manejarError(err, 'Error al crear acceso');
        },
      });
    }
  }

}
