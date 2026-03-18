import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-page">
      <div class="auth-grid-bg"></div>
      <div class="auth-glow"></div>

      <div class="auth-card slide-up">
        <div class="auth-logo">
          <img src="assets/image.png" style="width:50px; border-radius:12px;" />
<div class="logo-text" style="display:flex; align-items:baseline; gap:6px;">
  <span style="
    font-weight:900;
    font-size:24px;
    letter-spacing:2px; /* reduced from 4px */
    font-family:'Poppins', sans-serif;
    background: linear-gradient(to right, #0a1f44, #1da1f2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    transform: scaleX(1.1);
  ">
    RELIVEX
  </span>

  <span style="
    font-weight:600;
    font-size:12px;
    color:#1da1f2;
  ">
    Employee Centre
  </span>
</div>
  </div>

        
        <p style="margin-bottom:28px;font-size:0.9rem">Sign in to your account</p>

        <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Employee ID <span>*</span></label>
            <input class="form-control" formControlName="employeeId"
              placeholder="e.g. RLX005" autocomplete="username"
              [class.is-invalid]="f['employeeId'].touched && f['employeeId'].invalid">
            <div class="form-error" *ngIf="f['employeeId'].touched && f['employeeId'].errors?.['required']">
              Developer ID is required
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password <span>*</span></label>
            <div class="input-group">
              <input class="form-control" formControlName="password"
                [type]="showPass ? 'text' : 'password'"
                placeholder="Enter your password" autocomplete="current-password">
              <span class="input-icon" (click)="showPass = !showPass">
                {{ showPass ? '🙈' : '👁' }}
              </span>
            </div>
            <div class="form-error" *ngIf="f['password'].touched && f['password'].errors?.['required']">
              Password is required
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg"
            [disabled]="loading || form.invalid">
            <span *ngIf="loading" class="spinner spinner-sm"></span>
            <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:0.85rem;color:var(--text2)">
          <a routerLink="/forgot" style="color:var(--blue-main);font-weight:600">Forgot password?</a>
          <a routerLink="/register" style="color:var(--blue-main);font-weight:600">Register</a>
        </div>

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
          <p style="font-size:0.78rem;color:var(--text3);margin-bottom:8px;text-align:center">Demo credentials</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button *ngFor="let d of demos" class="btn btn-outline btn-sm"
              (click)="fillDemo(d.id)" style="font-size:0.75rem;justify-content:flex-start">
              {{ d.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';
  showPass = false;

  demos = [
    { id: 'RLX001', label: '★ CEO' },
    { id: 'RLX002', label: '◎ Finance' },
    { id: 'RLX003', label: '✓ Manager' },
    { id: 'RLX005', label: '◉ Developer (IN)' },
    { id: 'RLX009', label: '◉ Developer (US)' },
    { id: 'RLX006', label: '◉ Developer (Low)' },
  ];

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      employeeId: ['', Validators.required],
      password:   ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  fillDemo(id: string): void {
    this.form.patchValue({ employeeId: id, password: 'password123' });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';

    const employeeId = this.form.value.employeeId?.trim();
    const password = this.form.value.password;
    this.auth.login(employeeId, password).subscribe({
      next: (res) => {
        if (res.success) this.router.navigate(['/dashboard']);
        else { this.errorMsg = res.message; this.loading = false; }
      },
      error: (err) => {
        console.error('Login error', err);
        this.errorMsg = err.error?.message || err.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
