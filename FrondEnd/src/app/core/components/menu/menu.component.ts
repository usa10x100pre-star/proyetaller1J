import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../servicios/auth.service.service'; // 👈 Ajusta la ruta si es necesario
import { AuthResponse, Menu, Proceso, Role } from '../../models/auth-response.model'; // 👈 Ajusta la ruta
import { NotificationService } from '../../servicios/notification.service';
@Component({
  selector: 'app-menu', // (Asegúrate que este selector sea correcto)
  templateUrl: './menu.component.html',
  standalone:false,
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  // --- Variables para el Modal y el Formulario ---
  modalOpen = false;
  usuario = '';
  password = '';
  fechaActual = new Date();

  // --- 👇 LÓGICA DE SESIÓN ---
  // Tu HTML depende de una variable 'login'.
  // La mantenemos y la sincronizamos con el servicio.
  login: AuthResponse | null = null;
   selectedRole: Role | null = null; // Para el dropdown de roles
  procesosDisponibles: Proceso[] = [];


  // Hacemos el servicio 'public' para que el HTML pueda usarlo
  constructor(
    public authService: AuthServiceService, // 👈 Inyectado como 'public'
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Al iniciar el componente, carga la sesión desde localStorage
    this.actualizarEstadoLogin();
  }

  /**
   * Carga la sesión actual desde el AuthService.
   */
  actualizarEstadoLogin(): void {
    if (this.authService.isLoggedIn()) {
      this.login = this.authService.getCurrentSession<AuthResponse>('currentUser');
      // Selecciona el rol activo previamente guardado o el primero disponible
      const activeRoleName = this.authService.getActiveRole();
      const activeRole = this.login?.roles.find((r) => r.nombre === activeRoleName);
      this.selectedRole = activeRole ?? this.login?.roles[0] ?? null;
      this.authService.setActiveRole(this.selectedRole?.nombre ?? null);
       this.actualizarProcesosDisponibles(this.selectedRole);
    } else {
      this.login = null;
      this.selectedRole = null;
        this.procesosDisponibles = [];
    }
  }

  /**
   * Llamado por el formulario de login.
   */
  ingreso_sistema(): void {
    this.authService.getLogin(this.usuario, this.password).subscribe({
      next: (response) => {
        // 1. Guarda la sesión
        this.authService.setCurrentSession('currentUser', response);
        // 2. Actualiza el estado local
        this.actualizarEstadoLogin();
        // 3. Cierra el modal
        this.cancelar();
        // 4. Redirige (opcional, si el home es solo para invitados)
        // this.router.navigate(['/UserGes']); // O a una página de "dashboard"
      },
      error: (err) => {
        console.error('Error en el login:', err);
       this.notificationService.showError('Usuario o contraseña incorrectos');
      }
    });
  }

  /**
   * Llama al servicio de logout.
   */
  logout(): void {
    this.authService.logout();
    this.actualizarEstadoLogin();
  }

  // --- Control del Modal ---
  openModal(): void {
    this.modalOpen = true;
  }

  cancelar(): void {
    this.modalOpen = false;
    this.usuario = '';
    this.password = '';
  }

  // --- Lógica del Dropdown de Roles (opcional) ---
   selectRole(rol: Role | null): void {
    // Esta función se llama si el usuario cambia de rol en el dropdown.
    // Aquí podrías añadir lógica para refrescar permisos si fuera necesario.
     if (!rol) {
      this.selectedRole = null;
      this.authService.setActiveRole(null);
      this.actualizarProcesosDisponibles(null);
      return;
    }
    console.log("Rol cambiado a:", rol.nombre);
    this.selectedRole = rol;
    this.authService.setActiveRole(rol?.nombre ?? null);
    this.actualizarProcesosDisponibles(rol);
  }

  actualizarProcesosDisponibles(rol: Role | null): void {
    if (!rol?.menus) {
      this.procesosDisponibles = [];
      return;
    }

    const vistos = new Set<number | undefined>();
    this.procesosDisponibles = rol.menus
      .flatMap((menu: Menu) => menu.procesos ?? [])
      .map((proceso) => ({
        ...proceso,
        enlace: this.normalizarEnlace(proceso.enlace),
      }))
      .filter((proceso) => {
         // Descarta procesos sin enlace utilizable o repetidos
        if (!proceso.enlace) {
          return false;
        }

        const id = proceso.codp;
        if (vistos.has(id)) {
          return false;
        }
        vistos.add(id);
          return (proceso.estado ?? 1) === 1;
      });
  }

  compararRoles = (a: Role | null, b: Role | null): boolean => a?.codr === b?.codr;

  /**
   * Normaliza las rutas recibidas desde el backend para evitar rutas relativas
   * que provoquen páginas vacías al navegar.
   */
  private normalizarEnlace(enlace?: string): string | undefined {
    const limpio = (enlace ?? '').trim();
    if (!limpio) return undefined;

    const conSlash = limpio.startsWith('/') ? limpio : `/${limpio}`;
    // Evita rutas con espacios o // duplicados que puedan romper el router
    return conSlash.replace(/\s+/g, '').replace(/\/+/g, '/');
}
}