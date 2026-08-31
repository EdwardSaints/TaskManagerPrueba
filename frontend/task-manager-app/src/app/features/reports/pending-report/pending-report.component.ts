import { Component, OnInit, OnDestroy, inject, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../core/services/report.service';
import { PendingTaskReport } from '../../../core/models/pending-task-report.model';

declare var Chart: any;

@Component({
  selector: 'app-pending-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1><i class="bi bi-bar-chart-line me-2" style="color:#3b82f6"></i>Reporte de Tareas Pendientes</h1>
    </div>

    <div class="page-body">
      <!-- Stats Grid -->
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card blue">
          <div class="stat-icon stat-icon-blue"><i class="bi bi-people"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalUsers() }}</div>
            <div class="stat-label">Usuarios con tareas</div>
          </div>
        </div>
        <div class="stat-card amber">
          <div class="stat-icon stat-icon-yellow"><i class="bi bi-hourglass-split"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalPending() }}</div>
            <div class="stat-label">Total pendientes</div>
          </div>
        </div>
        <div class="stat-card" style="--stat-color:#ef4444">
          <div class="stat-icon" style="background:#fef2f2;color:#ef4444"><i class="bi bi-exclamation-triangle"></i></div>
          <div class="stat-content">
            <div class="stat-value" style="color:#ef4444">{{ totalOverdue() }}</div>
            <div class="stat-label">Total vencidas</div>
          </div>
        </div>
      </div>

      <!-- Charts Section (only visible if there is data and not loading) -->
      @if (!loading() && reportData().length > 0) {
        <div class="row g-4 mb-4">
          <div class="col-lg-7 col-12">
            <div class="table-card" style="padding:20px; height: 100%;">
              <h5 class="mb-3" style="font-size:15px;font-weight:600;color:#1e293b">Comparativa: Pendientes vs Vencidas por Usuario</h5>
              <div style="position:relative; height: 260px; width: 100%;">
                <canvas id="barChart"></canvas>
              </div>
            </div>
          </div>
          <div class="col-lg-5 col-12">
            <div class="table-card" style="padding:20px; height: 100%;">
              <h5 class="mb-3" style="font-size:15px;font-weight:600;color:#1e293b">Distribucion de Carga Pendiente</h5>
              <div style="position:relative; height: 260px; width: 100%; display:flex; justify-content:center;">
                <canvas id="doughnutChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Table -->
      <div class="table-card">
        <div class="table-card-header">
          <h5>Detalle por usuario</h5>
        </div>

        @if (loading()) {
          <div class="empty-state">
            <div class="spinner" style="margin:0 auto 16px"></div>
            <p>Generando reporte...</p>
          </div>
        } @else if (reportData().length === 0) {
          <div class="empty-state">
            <i class="bi bi-emoji-smile"></i>
            <h6>Todo al dia</h6>
            <p>No hay tareas pendientes en el sistema.</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th style="text-align:center">Pendientes</th>
                  <th style="text-align:center">Vencidas</th>
                  <th style="text-align:center">Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (item of reportData(); track item.usuario) {
                  <tr>
                    <td style="font-weight:600;color:#1e293b">
                      <i class="bi bi-person-circle me-2" style="color:#94a3b8"></i>
                      {{ item.usuario }}
                    </td>
                    <td style="text-align:center">
                      <span class="status-pendiente">{{ item.totalPendientes }}</span>
                    </td>
                    <td style="text-align:center">
                      @if (item.totalVencidas > 0) {
                        <span class="priority-alta">{{ item.totalVencidas }}</span>
                      } @else {
                        <span class="priority-baja">0</span>
                      }
                    </td>
                    <td style="text-align:center">
                      @if (item.totalVencidas > 0) {
                        <span class="status-en-progreso" style="background:#fef2f2;color:#dc2626;border-color:#fecaca">
                          <i class="bi bi-exclamation-triangle me-1"></i>Atencion
                        </span>
                      } @else {
                        <span class="status-terminada">
                          <i class="bi bi-check-circle me-1"></i>Al corriente
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class PendingReportComponent implements OnInit, OnDestroy {
  private reportService = inject(ReportService);

  reportData = signal<PendingTaskReport[]>([]);
  loading = signal(false);

  totalUsers = computed(() => this.reportData().length);
  totalPending = computed(() => this.reportData().reduce((acc, curr) => acc + curr.totalPendientes, 0));
  totalOverdue = computed(() => this.reportData().reduce((acc, curr) => acc + curr.totalVencidas, 0));

  private barChartInstance: any = null;
  private doughnutChartInstance: any = null;

  ngOnInit() {
    this.loadReport();
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  loadReport() {
    this.loading.set(true);
    this.reportService.getPendingTasksReport().subscribe({
      next: (res) => {
        if (res.success) {
          this.reportData.set(res.data);
          // Inicializar los charts tras una breve espera para que Angular renderice los canvas
          setTimeout(() => this.initCharts(), 50);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  destroyCharts() {
    if (this.barChartInstance) {
      this.barChartInstance.destroy();
      this.barChartInstance = null;
    }
    if (this.doughnutChartInstance) {
      this.doughnutChartInstance.destroy();
      this.doughnutChartInstance = null;
    }
  }

  initCharts() {
    this.destroyCharts();

    const data = this.reportData();
    if (!data || data.length === 0 || typeof Chart === 'undefined') return;

    const labels = data.map(d => d.usuario);
    const pendingData = data.map(d => d.totalPendientes);
    const overdueData = data.map(d => d.totalVencidas);

    // Grafico de barras para comparar pendientes y vencidas
    const ctxBar = document.getElementById('barChart') as HTMLCanvasElement;
    if (ctxBar) {
      this.barChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Pendientes',
              data: pendingData,
              backgroundColor: '#3b82f6',
              borderRadius: 6,
            },
            {
              label: 'Vencidas',
              data: overdueData,
              backgroundColor: '#ef4444',
              borderRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }
      });
    }

    // Grafico de dona para mostrar la distribucion de carga
    const ctxDoughnut = document.getElementById('doughnutChart') as HTMLCanvasElement;
    if (ctxDoughnut) {
      this.doughnutChartInstance = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: pendingData,
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#8b5cf6',
              '#ec4899'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  }
}
