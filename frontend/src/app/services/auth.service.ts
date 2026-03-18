import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  _id: string;
  name: string;
  employeeId: string;
  role: 'Developer' | 'Employee' | 'Manager' | 'Finance' | 'CEO';
  email: string;
  photo: string;
  country: string;
  salary: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    try {
      const u = localStorage.getItem('rlx_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean { return !!localStorage.getItem('rlx_token'); }
  get token(): string | null { return localStorage.getItem('rlx_token'); }

  login(employeeId: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { employeeId, password }).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('rlx_token', res.token);
          localStorage.setItem('rlx_user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  register(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, formData).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('rlx_token', res.token);
          localStorage.setItem('rlx_user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('rlx_token');
    localStorage.removeItem('rlx_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('rlx_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  forgotPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot`, { email, newPassword });
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.currentUser?.role || '');
  }
}
