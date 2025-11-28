import { Component, OnInit } from '@angular/core';
import { Item } from '../../models/auth-response.model';
import { ItemsService } from '../../servicios/items.service';
import { NotificationService } from '../../servicios/notification.service';
import { imprimirTablaDesdeId } from '../../utils/print-utils';
@Component({
  selector: 'app-gestion-items',
  standalone: false,
  templateUrl: './gestion-items.component.html',
  styleUrl: './gestion-items.component.css'
})
export class GestionItemsComponent implements OnInit {
  items: Item[] = [];
  filtro = '';
  filtroEstado = 'TODOS';
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 0;
  modalItemVisible = false;
  modalConfirmVisible = false;
  modoEdicion = false;
  mensajeConfirmacion = '';
  itemSeleccionado: Item | null = null;
  tipoConfirmacion: 'eliminar' | 'habilitar' = 'eliminar';

  constructor(
    private itemsService: ItemsService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cargarItems();
  }

  cargarItems(): void {
    if (isNaN(this.paginaActual) || this.paginaActual < 1) {
      this.paginaActual = 1;
    }

    this.itemsService
      .listarPaginado(this.filtro, this.filtroEstado, this.paginaActual, this.itemsPorPagina)
      .subscribe({
        next: (res) => {
          this.items = res.content;
          this.totalPaginas = res.totalPages;
          this.paginaActual = res.number + 1;
        },
        error: (err) => {
          console.error('Error al cargar items:', err);
          // ❌ Ya no llamamos a showError aquí. El ErrorInterceptor muestra error.error.mensaje
        }
      });
  }

  onFiltroChange() {
    this.paginaActual = 1;
    this.cargarItems();
  }

  onEstadoChange() {
    this.paginaActual = 1;
    this.cargarItems();
  }

  cambiarPagina(page: number) {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.cargarItems();
    }
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.itemSeleccionado = { nombre: '' };
    this.modalItemVisible = true;
  }

  abrirModalEditar(item: Item) {
    this.modoEdicion = true;
    this.itemSeleccionado = item;
    this.modalItemVisible = true;
  }

  guardarItem(item: Item) {
    this.itemsService.crear(item).subscribe({
      next: () => {
        this.paginaActual = 1;
        this.filtroEstado = 'TODOS';
        this.cargarItems();
        this.cerrarModalItem();
        this.notificationService.showSuccess('Item creado correctamente');
      },
      error: (err) => {
        console.error('Error al crear item:', err);
        // ❌ Nada de showError, lo muestra el interceptor con el mensaje del backend
      }
    });
  }

  modificarItem(item: Item) {
    if (!item.codi) return;

    this.itemsService.modificar(item.codi, item).subscribe({
      next: () => {
        this.cargarItems();
        this.cerrarModalItem();
        this.notificationService.showSuccess('Item modificado correctamente');
      },
      error: (err) => {
        console.error('Error al modificar item:', err);
        // ❌ El interceptor toma error.error.mensaje y lo enseña
      }
    });
  }

  confirmarEliminar(item: Item) {
    this.tipoConfirmacion = 'eliminar';
    this.itemSeleccionado = item;
    this.mensajeConfirmacion = '¿Seguro de Eliminar el Item?';
    this.modalConfirmVisible = true;
  }

  confirmarHabilitar(item: Item) {
    this.tipoConfirmacion = 'habilitar';
    this.itemSeleccionado = item;
    this.mensajeConfirmacion = '¿Seguro de Habilitar el Item?';
    this.modalConfirmVisible = true;
  }

  ejecutarConfirmacion() {
    if (!this.itemSeleccionado?.codi) return;

    const id = this.itemSeleccionado.codi;
    const obs = this.tipoConfirmacion === 'eliminar'
      ? this.itemsService.eliminar(id)
      : this.itemsService.habilitar(id);

    obs.subscribe({
      next: () => {
        this.cargarItems();
        this.cerrarModalConfirmacion();
        const accion = this.tipoConfirmacion === 'eliminar' ? 'eliminado' : 'habilitado';
        this.notificationService.showSuccess(`Item ${accion} correctamente`);
      },
      error: (err) => {
        console.error('Error al cambiar estado del item:', err);
        // ❌ De nuevo, el mensaje amigable viene del backend + interceptor
      }
    });
  }

  cerrarModalItem() {
    this.modalItemVisible = false;
    this.itemSeleccionado = null;
  }

  cerrarModalConfirmacion() {
    this.modalConfirmVisible = false;
    this.itemSeleccionado = null;
  }
   imprimirTabla(): void {
    imprimirTablaDesdeId('tabla-items', 'Listado de Ítems');
  }
}
