import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LoadingOverlayComponent],
  template: `
    <app-loading-overlay></app-loading-overlay>

    <!-- Mobile topbar (visible < 992px) -->
    <div class="mobile-topbar">
      <i class="bi bi-check2-square brand-icon"></i>
      <span class="brand-name">Task Manager</span>
      <button class="hamburger-btn" (click)="toggleSidebar()">
        <i class="bi" [class.bi-x-lg]="sidebarOpen()" [class.bi-list]="!sidebarOpen()"></i>
      </button>
    </div>

    <!-- Overlay for mobile -->
    <div class="sidebar-overlay" [class.visible]="sidebarOpen()" (click)="toggleSidebar()"></div>

    <div class="app-layout">
      <!-- Sidebar colapsable con hover -->
      <aside class="sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-brand">
          <i class="bi bi-check2-square sidebar-brand-icon"></i>
          <span class="nav-label">Task Manager</span>
        </div>
        <div class="sidebar-section"><span class="nav-label">Menu</span></div>
        <nav class="sidebar-nav">
          <a class="sidebar-link" routerLink="/tasks" routerLinkActive="active" (click)="closeSidebar()" title="Tareas">
            <i class="bi bi-list-task"></i>
            <span class="nav-label">Tareas</span>
          </a>
          <a class="sidebar-link" routerLink="/reports/pending" routerLinkActive="active" (click)="closeSidebar()" title="Reportes">
            <i class="bi bi-bar-chart-line"></i>
            <span class="nav-label">Reportes</span>
          </a>
        </nav>
      </aside>

      <!-- Main content -->
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AppComponent {
  sidebarOpen = signal(false);
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar() { this.sidebarOpen.set(false); }
}
