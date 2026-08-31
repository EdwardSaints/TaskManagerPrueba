import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priorityBadge',
  standalone: true
})
export class PriorityBadgePipe implements PipeTransform {
  transform(value: string): { label: string; class: string } {
    switch (value) {
      case 'High': return { label: 'Alta', class: 'badge bg-danger' };
      case 'Medium': return { label: 'Media', class: 'badge bg-warning text-dark' };
      case 'Low': return { label: 'Baja', class: 'badge bg-success' };
      default: return { label: value, class: 'badge bg-secondary' };
    }
  }
}
