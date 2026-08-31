import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { TaskDto, CreateTaskDto } from '../../../core/models/task.model';
import { UserDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <!-- Toast -->
    @if (toastMessage()) {
      <div class="toast-container">
        <div class="toast" [class.toast-success]="toastType() === 'success'" [class.toast-danger]="toastType() === 'danger'">
          <i class="bi" [class.bi-check-circle-fill]="toastType() === 'success'" [class.bi-x-circle-fill]="toastType() === 'danger'"></i>
          {{ toastMessage() }}
        </div>
      </div>
    }

    <!-- Form Modal -->
    @if (showFormModal()) {
      <div class="modal-overlay" (click.self)="closeForm()">
        <div class="modal-box">
          <div class="modal-header">
            <h5>{{ editingTaskId() ? 'Editar Tarea' : 'Nueva Tarea' }}</h5>
            <button class="btn-icon" (click)="closeForm()"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="taskForm">
              <div class="form-group">
                <label>Titulo <span style="color:#ef4444">*</span></label>
                <input formControlName="title" class="form-control" [class.is-invalid]="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" placeholder="Nombre de la tarea">
                @if (taskForm.get('title')?.invalid && taskForm.get('title')?.touched) {
                  <div class="invalid-feedback">El titulo es obligatorio</div>
                }
              </div>
              <div class="form-group">
                <label>Descripcion</label>
                <textarea formControlName="description" class="form-control" rows="3" placeholder="Descripcion opcional"></textarea>
              </div>
              <div class="row">
                <div class="col-6">
                  <div class="form-group">
                    <label>Prioridad <span style="color:#ef4444">*</span></label>
                    <select formControlName="priority" class="form-select">
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                </div>
                <div class="col-6">
                  <div class="form-group">
                    <label>Estado</label>
                    <select formControlName="status" class="form-select">
                      <option value="Pendiente">Pendiente</option>
                      <option value="En progreso">En progreso</option>
                      <option value="Terminada">Terminada</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-6">
                  <div class="form-group">
                    <label>Fecha limite <span style="color:#ef4444">*</span></label>
                    <input type="date" formControlName="dueDate" class="form-control"
                      [class.is-invalid]="taskForm.get('dueDate')?.invalid && taskForm.get('dueDate')?.touched || (taskForm.hasError('dueDateBeforeStart') && taskForm.get('dueDate')?.touched)">
                    @if (taskForm.get('dueDate')?.invalid && taskForm.get('dueDate')?.touched) {
                      <div class="invalid-feedback">La fecha limite es obligatoria</div>
                    }
                    @if (taskForm.hasError('dueDateBeforeStart') && taskForm.get('dueDate')?.touched) {
                      <div class="invalid-feedback d-block">La fecha limite debe ser mayor o igual a la fecha de inicio</div>
                    }
                  </div>
                </div>
                <div class="col-6">
                  <div class="form-group">
                    <label>Responsable <span style="color:#ef4444">*</span></label>
                    <select formControlName="userId" class="form-select" [class.is-invalid]="taskForm.get('userId')?.invalid && taskForm.get('userId')?.touched">
                      <option value="">Seleccionar usuario</option>
                      @for (user of users(); track user.id) {
                        <option [value]="user.id">{{ user.name }}</option>
                      }
                    </select>
                    @if (taskForm.get('userId')?.invalid && taskForm.get('userId')?.touched) {
                      <div class="invalid-feedback">El responsable es obligatorio</div>
                    }
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-6">
                  <div class="form-group">
                    <label>Fecha de inicio</label>
                    <input type="date" formControlName="startDate" class="form-control">
                  </div>
                </div>
                <div class="col-6">
                  <div class="form-group">
                    <label>Fecha de finalizacion</label>
                    <input type="date" formControlName="endDate" class="form-control"
                      [class.is-invalid]="taskForm.hasError('endDateBeforeStart') || taskForm.hasError('endDateWithoutTerminada')">
                    @if (taskForm.hasError('endDateBeforeStart')) {
                      <div class="invalid-feedback d-block">La fecha de finalizacion debe ser mayor o igual a la fecha de inicio</div>
                    }
                    @if (taskForm.hasError('endDateWithoutTerminada')) {
                      <div class="invalid-feedback d-block">Solo registra la fecha de finalizacion cuando el estado sea "Terminada"</div>
                    }
                  </div>
                </div>
              </div>
              <!-- Resumen visual del flujo de fechas -->
              @if (taskForm.get('startDate')?.value || taskForm.get('endDate')?.value) {
                <div style="background:#f8fafc;border-radius:8px;padding:10px 14px;font-size:12px;color:#64748b;border:1px solid #e2e8f0;margin-top:4px;">
                  <i class="bi bi-info-circle me-1" style="color:#3b82f6"></i>
                  <strong>Flujo de fechas:</strong>
                  Creacion → Inicio → Fecha limite → Finalizacion
                </div>
              }
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn-icon" (click)="closeForm()">Cancelar</button>
            <button class="btn-primary-custom" (click)="saveTask()" [disabled]="taskForm.invalid">
              <i class="bi bi-check-lg"></i>
              {{ editingTaskId() ? 'Guardar cambios' : 'Crear tarea' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Modal -->
    @if (showDeleteModal()) {
      <div class="modal-overlay" (click.self)="closeDelete()">
        <div class="modal-box" style="max-width:400px">
          <div class="modal-header">
            <h5>Eliminar tarea</h5>
            <button class="btn-icon" (click)="closeDelete()"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body">
            <p style="color:#475569;font-size:14px;">Esta accion no se puede deshacer. La tarea sera marcada como eliminada.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-icon" (click)="closeDelete()">Cancelar</button>
            <button class="btn-primary-custom" style="background:#ef4444" (click)="confirmDeleteAction()">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Page header -->
    <div class="page-header">
      <h1><i class="bi bi-list-task me-2" style="color:#3b82f6"></i>Gestion de Tareas</h1>
      <button class="btn-primary-custom" (click)="openForm()">
        <i class="bi bi-plus-lg"></i> Nueva Tarea
      </button>
    </div>

    <div class="page-body">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon stat-icon-blue"><i class="bi bi-list-check"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalCount() }}</div>
            <div class="stat-label">Total de tareas</div>
          </div>
        </div>
        <div class="stat-card amber">
          <div class="stat-icon stat-icon-yellow"><i class="bi bi-clock"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ pendingCount() }}</div>
            <div class="stat-label">Pendientes</div>
          </div>
        </div>
        <div class="stat-card indigo">
          <div class="stat-icon stat-icon-indigo"><i class="bi bi-arrow-right-circle"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ inProgressCount() }}</div>
            <div class="stat-label">En progreso</div>
          </div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon stat-icon-green"><i class="bi bi-check-circle"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ doneCount() }}</div>
            <div class="stat-label">Terminadas</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div>
          <label>Prioridad</label>
          <select class="form-select" [(ngModel)]="filterPriority" (ngModelChange)="applyFilters()" style="min-width:120px">
            <option value="">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        <div>
          <label>Estado</label>
          <select class="form-select" [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" style="min-width:140px">
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Terminada">Terminada</option>
          </select>
        </div>
        <div>
          <label>Responsable</label>
          <select class="form-select" [(ngModel)]="filterUserId" (ngModelChange)="applyFilters()" style="min-width:150px">
            <option value="">Todos</option>
            @for (user of users(); track user.id) {
              <option [value]="user.id">{{ user.name }}</option>
            }
          </select>
        </div>
        <div>
          <label>Fecha desde</label>
          <input type="date" class="form-control" [(ngModel)]="filterStartDate" (ngModelChange)="applyFilters()" style="min-width:145px">
        </div>
        <div>
          <label>Fecha hasta</label>
          <input type="date" class="form-control" [(ngModel)]="filterEndDate" (ngModelChange)="applyFilters()" style="min-width:145px">
        </div>
        @if (filterPriority || filterStatus || filterUserId || filterStartDate || filterEndDate) {
          <div style="display:flex;align-items:flex-end">
            <button class="btn-icon" (click)="clearFilters()" title="Limpiar filtros" style="color:#ef4444;border-color:#fecaca">
              <i class="bi bi-x-circle me-1"></i> Limpiar
            </button>
          </div>
        }
      </div>

      <!-- Table -->
      <div class="table-card">
        <div class="table-card-header">
          <h5>Lista de tareas</h5>
          <span style="font-size:13px;color:#64748b">{{ totalCount() }} tareas en total</span>
        </div>

        @if (loading()) {
          <div class="empty-state">
            <div class="spinner" style="margin:0 auto 16px"></div>
            <p>Cargando tareas...</p>
          </div>
        } @else if (tasks().length === 0) {
          <div class="empty-state">
            <i class="bi bi-inbox"></i>
            <h6>Sin tareas</h6>
            <p>No se encontraron tareas con los filtros seleccionados.</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Descripcion</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Creacion</th>
                  <th>Ejecucion (Inicio - Fin)</th>
                  <th>Fecha limite</th>
                  <th>Responsable</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (task of tasks(); track task.id) {
                  <tr>
                    <td style="font-weight:600;color:#1e293b">{{ task.title }}</td>
                    <td style="color:#64748b;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ task.description || '-' }}</td>
                    <td>
                      @if (task.priority === 'Alta') { <span class="priority-alta">Alta</span> }
                      @else if (task.priority === 'Media') { <span class="priority-media">Media</span> }
                      @else { <span class="priority-baja">Baja</span> }
                    </td>
                    <td>
                      @if (task.status === 'Pendiente') { <span class="status-pendiente">Pendiente</span> }
                      @else if (task.status === 'En progreso') { <span class="status-en-progreso">En progreso</span> }
                      @else { <span class="status-terminada">Terminada</span> }
                    </td>
                    <td style="color:#64748b; font-size: 13px;">{{ task.createdAt | date:'dd/MM/yyyy' }}</td>
                    <td style="color:#64748b; font-size: 13px;">
                      @if (task.startDate) {
                        {{ task.startDate | date:'dd/MM/yyyy' }}
                      } @else {
                        -
                      }
                      /
                      @if (task.endDate) {
                        {{ task.endDate | date:'dd/MM/yyyy' }}
                      } @else {
                        -
                      }
                    </td>
                    <td style="color:#64748b">{{ task.dueDate | date:'dd/MM/yyyy' }}</td>
                    <td>{{ task.userName }}</td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon" (click)="openForm(task)" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="btn-icon btn-icon-danger" (click)="confirmDelete(task.id)" title="Eliminar"><i class="bi bi-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f1f5f9">
            <span style="font-size:13px;color:#64748b">Pagina {{ pageIndex() }} de {{ totalPages() }}</span>
            <div style="display:flex;gap:8px">
              <button class="btn-icon" [disabled]="pageIndex() === 1" (click)="changePage(pageIndex() - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button class="btn-icon" [disabled]="pageIndex() >= totalPages()" (click)="changePage(pageIndex() + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  tasks = signal<TaskDto[]>([]);
  users = signal<UserDto[]>([]);
  totalCount = signal<number>(0);
  pageIndex = signal<number>(1);
  pageSize = signal<number>(10);
  loading = signal(false);

  pendingCount = computed(() => this.tasks().filter(t => t.status === 'Pendiente').length);
  inProgressCount = computed(() => this.tasks().filter(t => t.status === 'En progreso').length);
  doneCount = computed(() => this.tasks().filter(t => t.status === 'Terminada').length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize())));

  showFormModal = signal(false);
  showDeleteModal = signal(false);
  editingTaskId = signal<number | null>(null);
  taskToDelete = signal<number | null>(null);
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'danger'>('success');

  filterPriority = '';
  filterStatus = '';
  filterUserId = '';
  filterStartDate = '';
  filterEndDate = '';

  taskForm: FormGroup;

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['Alta', Validators.required],
      status: ['Pendiente'],
      dueDate: ['', Validators.required],
      userId: ['', Validators.required],
      startDate: [''],
      endDate: ['']
    }, { validators: this.dateRulesValidator });
  }

  // Validador de reglas de negocio para fechas
  dateRulesValidator(group: AbstractControl): ValidationErrors | null {
    const startDate  = group.get('startDate')?.value;
    const endDate    = group.get('endDate')?.value;
    const dueDate    = group.get('dueDate')?.value;
    const status     = group.get('status')?.value;
    const errors: ValidationErrors = {};

    if (startDate && dueDate && dueDate < startDate) {
      errors['dueDateBeforeStart'] = true;
    }
    if (startDate && endDate && endDate < startDate) {
      errors['endDateBeforeStart'] = true;
    }
    if (endDate && status !== 'Terminada') {
      errors['endDateWithoutTerminada'] = true;
    }
    return Object.keys(errors).length ? errors : null;
  }

  ngOnInit() {
    this.loadTasks();
    this.loadUsers();
  }

  loadTasks() {
    this.loading.set(true);
    const filters: any = {};
    if (this.filterPriority)   filters.priority  = this.filterPriority;
    if (this.filterStatus)     filters.status    = this.filterStatus;
    if (this.filterUserId)     filters.userId    = Number(this.filterUserId);
    if (this.filterStartDate)  filters.startDate = this.filterStartDate;
    if (this.filterEndDate)    filters.endDate   = this.filterEndDate;

    this.taskService.getTasks(this.pageIndex(), this.pageSize(), filters).subscribe({
      next: (res) => {
        if (res.success) {
          this.tasks.set(res.data.items);
          this.totalCount.set(res.data.totalCount);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res) => { if (res.success) this.users.set(res.data); }
    });
  }

  applyFilters() {
    this.pageIndex.set(1);
    this.loadTasks();
  }

  clearFilters() {
    this.filterPriority  = '';
    this.filterStatus    = '';
    this.filterUserId    = '';
    this.filterStartDate = '';
    this.filterEndDate   = '';
    this.applyFilters();
  }

  changePage(page: number) {
    this.pageIndex.set(page);
    this.loadTasks();
  }

  openForm(task?: TaskDto) {
    this.taskForm.reset({ priority: 'Alta', status: 'Pendiente' });
    if (task) {
      this.editingTaskId.set(task.id);
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate.split('T')[0],
        userId: task.userId,
        startDate: task.startDate ? task.startDate.split('T')[0] : '',
        endDate: task.endDate ? task.endDate.split('T')[0] : ''
      });
    } else {
      this.editingTaskId.set(null);
    }
    this.showFormModal.set(true);
  }

  closeForm() { this.showFormModal.set(false); }

  saveTask() {
    if (this.taskForm.invalid) { this.taskForm.markAllAsTouched(); return; }
    const val = this.taskForm.value;
    const payload: any = { 
      ...val, 
      userId: Number(val.userId),
      startDate: val.startDate ? val.startDate : null,
      endDate: val.endDate ? val.endDate : null
    };
    const id = this.editingTaskId();

    if (id) {
      this.taskService.updateTask(id, payload).subscribe({
        next: () => { this.showToast('Tarea actualizada correctamente', 'success'); this.closeForm(); this.loadTasks(); },
        error: () => this.showToast('Error al actualizar la tarea', 'danger')
      });
    } else {
      this.taskService.createTask(payload).subscribe({
        next: () => { this.showToast('Tarea creada correctamente', 'success'); this.closeForm(); this.loadTasks(); },
        error: () => this.showToast('Error al crear la tarea', 'danger')
      });
    }
  }

  confirmDelete(id: number) {
    this.taskToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  closeDelete() { this.showDeleteModal.set(false); this.taskToDelete.set(null); }

  confirmDeleteAction() {
    const id = this.taskToDelete();
    if (!id) return;
    this.taskService.deleteTask(id).subscribe({
      next: () => { this.showToast('Tarea eliminada correctamente', 'success'); this.closeDelete(); this.loadTasks(); },
      error: () => this.showToast('Error al eliminar la tarea', 'danger')
    });
  }

  showToast(msg: string, type: 'success' | 'danger') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3500);
  }
}
