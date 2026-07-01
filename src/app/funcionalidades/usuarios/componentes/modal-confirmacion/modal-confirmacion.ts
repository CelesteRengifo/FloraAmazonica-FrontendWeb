import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-confirmacion',
  standalone: true,
  templateUrl: './modal-confirmacion.html',
  styleUrl: './modal-confirmacion.css',
})
export class ModalConfirmacion {
  titulo = input<string>('¿Confirmar acción?');
  mensaje = input<string>('Esta acción no se puede deshacer.');
  textoConfirmar = input<string>('Eliminar');

  confirmar = output<void>();
  cancelar = output<void>();
}