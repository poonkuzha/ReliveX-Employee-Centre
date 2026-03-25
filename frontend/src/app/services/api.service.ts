import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = `${environment.apiUrl}/api`;
  constructor(private http: HttpClient) {}

  // ── Dashboard ──────────────────────────────────────────────
  getDashboard(): Observable<any> { return this.http.get(`${this.base}/dashboard`); }

  // ── Profile ────────────────────────────────────────────────
  getProfile(): Observable<any>           { return this.http.get(`${this.base}/users/profile`); }
  updateProfile(fd: FormData): Observable<any> { return this.http.put(`${this.base}/users/profile`, fd); }

  // ── Jobs ───────────────────────────────────────────────────
  getJobs(): Observable<any>            { return this.http.get(`${this.base}/jobs`); }
  getRecommendedJobs(): Observable<any> { return this.http.get(`${this.base}/jobs/recommended`); }

  // ── Queries ────────────────────────────────────────────────
  submitQuery(data: any): Observable<any>  { return this.http.post(`${this.base}/query`, data); }
  getMyQueries(): Observable<any>          { return this.http.get(`${this.base}/query/my`); }
  getAllQueries(): Observable<any>         { return this.http.get(`${this.base}/query/all`); }

  // ── Expenses ───────────────────────────────────────────────
  submitExpense(data: any): Observable<any>     { return this.http.post(`${this.base}/expense`, data); }
  getMyExpenses(): Observable<any>              { return this.http.get(`${this.base}/expense/my`); }
  getExpenseById(id: string): Observable<any>   { return this.http.get(`${this.base}/expense/${id}`); }
  getAllExpenses(): Observable<any>              { return this.http.get(`${this.base}/expense/all`); }
  getPendingManager(): Observable<any>          { return this.http.get(`${this.base}/expense/pending-manager`); }
  getPendingFinance(): Observable<any>          { return this.http.get(`${this.base}/expense/pending-finance`); }
  getPendingCEO(): Observable<any>              { return this.http.get(`${this.base}/expense/pending-ceo`); }
  managerDecision(id: string, body: any): Observable<any>  { return this.http.put(`${this.base}/expense/${id}/manager`, body); }
  financeDecision(id: string, body: any): Observable<any>  { return this.http.put(`${this.base}/expense/${id}/finance`, body); }
  ceoDecision(id: string, body: any): Observable<any>      { return this.http.put(`${this.base}/expense/${id}/ceo`, body); }

  // ── Notifications ──────────────────────────────────────────
  getNotifications(): Observable<any>    { return this.http.get(`${this.base}/notifications`); }
  markAllRead(): Observable<any>         { return this.http.put(`${this.base}/notifications/mark-all-read`, {}); }
  markRead(id: string): Observable<any>  { return this.http.put(`${this.base}/notifications/${id}/read`, {}); }
}
