import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {
  transform(value: string): { label: string; class: string } {
    switch (value) {
      case 'Pending': return { label: 'Pendiente', class: 'badge bg-secondary' };
      case 'InProgress': return { label: 'En progreso', class: 'badge bg-primary' };
      case 'Done': return { label: 'Terminada', class: 'badge bg-success' };
      default: return { label: value, class: 'badge bg-secondary' };
    }
  }
}
