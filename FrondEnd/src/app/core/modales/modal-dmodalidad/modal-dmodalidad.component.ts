import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dmodalidad, Modalidad } from '../../models/auth-response.model';

@Component({
  selector: 'app-modal-dmodalidad',
  standalone: false,
  templateUrl: './modal-dmodalidad.component.html',
  styleUrls: ['./modal-dmodalidad.component.css']
})
export class ModalDmodalidadComponent {
  @Input() set detalleData(value: Dmodalidad) {
    this.detalle = { ...value };
  }

  @Input() modoEdicion = false;
  @Input() modalidades: Modalidad[] = [];

  @Output() guardar = new EventEmitter<Dmodalidad>();
  @Output() cerrar = new EventEmitter<void>();

  detalle: Dmodalidad = {
    coddm: '',
    nombre: '',
    modalidad: { codmod: 0 },
  };
}