import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-modal-persona',
  standalone: false,
  templateUrl: './modal-persona.component.html',
  styleUrls: ['./modal-persona.component.css']
})
export class ModalPersonaComponent implements OnChanges {
  @Input() modoEdicion = false;
  @Input() persona: any = {};
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<void>();
  @Output() fileChange = new EventEmitter<any>();

  telefonos: string[] = [];
  telefonoNuevo: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['persona']) {
      const lista = (this.persona?.telf as string) || '';
      const parsed = lista
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      this.telefonos = parsed.length > 0 ? parsed : [];
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileChange.emit(file);
    }
  }

  agregarTelefono(): void {
    const nuevo = (this.telefonoNuevo || '').trim();
    if (!nuevo) return;

    // Si no quieres duplicados, descomenta esto:
    // if (this.telefonos.includes(nuevo)) {
    //   this.telefonoNuevo = '';
    //   return;
    // }

    this.telefonos.push(nuevo);
    this.sincronizarTelefonos();
    this.telefonoNuevo = '';
  }

  eliminarTelefono(indice: number): void {
    this.telefonos.splice(indice, 1);
    this.sincronizarTelefonos();
  }

  private sincronizarTelefonos(): void {
    const limpiados = this.telefonos
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    this.persona.telf = limpiados.join(', ');
  }

  onGuardar(): void {
    this.sincronizarTelefonos();
    this.guardar.emit();
  }
}
