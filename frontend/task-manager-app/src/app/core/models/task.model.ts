export type TaskPriority = 'Alta' | 'Media' | 'Baja';
export type TaskStatus = 'Pendiente' | 'En progreso' | 'Terminada';

export interface TaskDto {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string | null;
  endDate: string | null;
  dueDate: string;
  createdAt: string;
  updatedAt: string | null;
  userId: number;
  userName: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  startDate?: string;
  userId: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  userId?: number;
}

export interface TaskFilterDto {
  status?: string;
  priority?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PendingTaskReport {
  usuario: string;
  totalPendientes: number;
  totalVencidas: number;
}
