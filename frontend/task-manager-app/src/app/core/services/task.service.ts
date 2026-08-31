import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../models/task.model';
import { PagedResult } from '../models/paged-result.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/tasks';

  getTasks(page: number, pageSize: number, filters?: TaskFilterDto): Observable<ApiResponse<PagedResult<TaskDto>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.userId) params = params.set('userId', filters.userId.toString());
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }
    return this.http.get<ApiResponse<PagedResult<TaskDto>>>(this.apiUrl, { params });
  }

  getTaskById(id: number): Observable<ApiResponse<TaskDto>> {
    return this.http.get<ApiResponse<TaskDto>>(this.apiUrl + '/' + id);
  }

  createTask(task: CreateTaskDto): Observable<ApiResponse<TaskDto>> {
    return this.http.post<ApiResponse<TaskDto>>(this.apiUrl, task);
  }

  updateTask(id: number, task: UpdateTaskDto): Observable<ApiResponse<TaskDto>> {
    return this.http.put<ApiResponse<TaskDto>>(this.apiUrl + '/' + id, task);
  }

  deleteTask(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(this.apiUrl + '/' + id);
  }

  getPendingReport(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl + '/reports/pending');
  }
}
