import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PendingTaskReport } from '../models/pending-task-report.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/reports';

  getPendingTasksReport(): Observable<ApiResponse<PendingTaskReport[]>> {
    return this.http.get<ApiResponse<PendingTaskReport[]>>(`${this.apiUrl}/pending-tasks`);
  }
}
