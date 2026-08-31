import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-overlay">
        <div class="spinner"></div>
        <span style="font-size:14px;color:#64748b;font-weight:500;">Cargando...</span>
      </div>
    }
  `
})
export class LoadingOverlayComponent {
  loadingService = inject(LoadingService);
}
