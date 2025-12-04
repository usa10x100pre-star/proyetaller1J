import { Component, OnInit } from '@angular/core';
import { PersonalService, Personal } from '../../servicios/personal.service';
import { NotificationService } from '../../servicios/notification.service';
import { environment } from '../../../../environments/environment';
import { imprimirTablaDesdeId } from '../../utils/print-utils';
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
  get usuariosFiltrados(): Personal[] {
    return this.filtrar();
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
 getFotoUrl(foto?: string | null): string {
    const fallback = 'default-user.png';
      const normalizada = (foto || '').trim().toLowerCase();
    const nombreFoto = (!normalizada || normalizada === 'null' || normalizada === 'undefined'
      || normalizada === 'default' || normalizada === 'default-user')
      ? fallback
      : foto!;

    return `${this.apiURL}/uploads/fotos/${nombreFoto}`;
  }
  /**
   * Muestra un error amigable usando el mensaje del backend si está disponible.
   */
  private manejarError(err: any, mensajePorDefecto: string): void {
    const mensajeBackend =
      err?.error?.message ||
      err?.error?.mensaje ||
      err?.error?.details ||
      err?.error?.detalle;

    const mensaje = mensajeBackend || err?.message || mensajePorDefecto;
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
     const mensajeError = this.validarCedulaObligatoria(this.nuevaPersona);
    if (mensajeError) {
      this.notificationService.showError(mensajeError);
      return;
    }

    // primero guarda la persona en PERSONAL (el backend registra la cédula en DATOS)
    this.personalService.crear(this.nuevaPersona, this.nuevaFoto!).subscribe({
       next: () => {
        this.notificationService.showSuccess('Persona creada correctamente');
        this.cargarUsuarios();
        this.modalPersonaVisible = false;
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
     const mensajeError = this.validarCedulaObligatoria(this.nuevaPersona);
    if (mensajeError) {
      this.notificationService.showError(mensajeError);
      return;
    }
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


  imprimirUsuarios(persona?: Personal): void {
    const usuarios = persona ? [persona] : this.filtrar();

    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) {
      this.notificationService.showError('No se pudo abrir la vista de impresión.');
      return;
    }

    const filas = usuarios.map((u) => `
      <tr>
        <td style="padding:12px; vertical-align:top;">
          <img src="${this.getFotoUrl(u.foto)}" alt="Foto de ${u.nombre}" style="width:72px;height:72px;object-fit:cover;border-radius:12px;border:1px solid #cbd5e1;" />
        </td>
        <td style="padding:12px;">
          <div style="font-weight:700;color:#0f172a;font-size:16px;">${u.ap} ${u.am ?? ''} ${u.nombre}</div>
          <div style="margin-top:4px;color:#1e293b;font-size:14px;">Cédula: <strong>${u.cedula ?? '—'}</strong></div>
          <div style="color:#334155;font-size:14px;">Tipo: ${u.tipo === 'P' ? 'Profesor' : u.tipo === 'E' ? 'Estudiante' : 'Administrativo'}</div>
          <div style="color:#334155;font-size:14px;">Estado: ${u.estado === 1 ? 'Activo' : 'Inactivo'}</div>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Listado de Personal</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 24px; color: #0f172a; }
            h1 { text-align: center; color: #1e3a8a; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            tr { border-bottom: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <h1>Listado de Personal</h1>
          <table>
            ${filas}
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
   const finalizarImpresion = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };

    const imagenes = Array.from(printWindow.document.images);
    if (imagenes.length === 0) {
      finalizarImpresion();
      return;
    }

    let cargadas = 0;
    const intentarFinalizar = () => {
      cargadas += 1;
      if (cargadas === imagenes.length) finalizarImpresion();
    };

    imagenes.forEach((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        intentarFinalizar();
      } else {
        img.onload = intentarFinalizar;
        img.onerror = intentarFinalizar;
      }
    });
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
       cedula: '',
      nombre: '',
      ap: '',
      am: '',
      genero: '',
      tipo: '',
      ecivil: '',
      estado: 1,
    };
  }
  private validarCedulaObligatoria(persona: Personal): string | null {
    const cedulaNormalizada = persona.cedula?.trim() || '';

    if (!cedulaNormalizada) {
      return 'La cédula es obligatoria';
    }

    persona.cedula = cedulaNormalizada;
    return null;
  }
  // Modal de acceso
  modalAccesoVisible = false;
  modoAccesoEdicion = false;
  personaAcceso: Personal | null = null;
  personaAccesoNombre = '';
  nuevoAcceso = { login: '', password: '', repetir: '' };

  abrirModalAcceso(persona: Personal, edicion: boolean): void {
    this.personaAcceso = persona;
    this.modoAccesoEdicion = edicion;
    this.nuevoAcceso = { login: '', password: '', repetir: '' };
    this.modalAccesoVisible = true;
  }

  cerrarModalAcceso(): void {
    this.modalAccesoVisible = false;
    this.personaAccesoNombre = '';
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
  imprimirTablaUsuarios(): void {
    imprimirTablaDesdeId('tabla-usuarios', 'Listado de Personal');
  }

}
