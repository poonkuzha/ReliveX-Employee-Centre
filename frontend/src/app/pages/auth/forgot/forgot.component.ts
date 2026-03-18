import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot',
  template: `
    <div class="auth-page">
      <div class="auth-grid-bg"></div>
      <div class="auth-glow"></div>
      <div class="auth-card slide-up">
        <div class="auth-logo">
          <img src="assets/image.png" style="width:50px; border-radius:12px;" />
          <div class="logo-text"><span class="logo-main">RELIVEX</span><span class="logo-sub">Developer Centre</span></div>
        </div>

        <h2 style="margin-bottom:6px">Forgot Password</h2>
        <p style="margin-bottom:16px;font-size:0.9rem;color:var(--text2)">
          Enter your registered email and new password.
        </p>

        <div class="alert alert-info" *ngIf="infoMsg">{{ infoMsg }}</div>
        <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-control" type="email" formControlName="email" placeholder="you@company.com">
          </div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input class="form-control" type="password" formControlName="newPassword" placeholder="Enter new password">
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input class="form-control" type="password" formControlName="confirmPassword" placeholder="Confirm new password">
            <div class="form-error" *ngIf="matchError">{{ matchError }}</div>
          </div>
          <button type="submit" class="btn btn-primary btn-full btn-lg" [disabled]="loading">
            <span *ngIf="loading" class="spinner spinner-sm"></span>
            <span>{{ loading ? 'Resetting...' : 'Reset Password' }}</span>
          </button>
        </form>

        <p style="margin-top:16px;text-align:center;font-size:0.9rem;color:var(--text2)">
          Remembered your password?
          <a routerLink="/login" style="font-weight:600;color:var(--blue-main)">Sign in</a>
        </p>
      </div>
    </div>
  `
})
export class ForgotComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';
  infoMsg = '';
  matchError = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.errorMsg = '';
    this.infoMsg = '';
    this.matchError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.matchError = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.auth.forgotPassword(this.form.value.email, this.form.value.newPassword).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.infoMsg = res.message;
          setTimeout(() => this.router.navigate(['/login']), 1200);
        } else {
          this.errorMsg = res.message || 'Could not reset password.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Failed to reset password. Try again.';
      }
    });
  }
}