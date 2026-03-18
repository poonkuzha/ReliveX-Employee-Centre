import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-page">
      <div class="auth-grid-bg"></div>
      <div class="auth-glow"></div>

      <div class="auth-card slide-up" style="max-width:520px">
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
        <h2 style="margin-bottom:6px">Create Account</h2>
        <p style="margin-bottom:24px;font-size:0.9rem">Register as a new Relivex Employee</p>

        <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>
        <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid-2" style="gap:16px">
            <div class="form-group">
              <label class="form-label">Full Name <span>*</span></label>
              <input class="form-control" formControlName="name" placeholder="Kavya Nair">
              <div class="form-error" *ngIf="f['name'].touched && f['name'].errors?.['required']">Required</div>
            </div>
            <div class="form-group">
              <label class="form-label">Employee ID <span>*</span></label>
              <input class="form-control" formControlName="employeeId" placeholder="RLX013" style="text-transform:uppercase">
              <div class="form-error" *ngIf="f['employeeId'].touched && f['employeeId'].errors?.['required']">Required</div>
            </div>
          </div>

          <div class="grid-2" style="gap:16px">
            <div class="form-group">
              <label class="form-label">Country <span>*</span></label>
              <select class="form-control" formControlName="country">
                <option value="">Select country</option>
                <option value="India">India</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Annual Salary <span>*</span></label>
              <input class="form-control" formControlName="salary" type="number" placeholder="100000" min="0">
              <div class="form-error" *ngIf="f['salary'].touched && f['salary'].errors?.['required']">Required</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Role <span>*</span></label>
            <select class="form-control" formControlName="role">
              <option value="Developer">Developer</option>
              <option value="Manager">Manager</option>
              <option value="Finance">Finance</option>
              <option value="CEO">CEO</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Email Address <span>*</span></label>
            <input class="form-control" formControlName="email" type="email" placeholder="kavya@relivex.com">
            <div class="form-error" *ngIf="f['email'].touched && f['email'].errors?.['required']">Required</div>
            <div class="form-error" *ngIf="f['email'].touched && f['email'].errors?.['email']">Invalid email</div>
          </div>

          <div class="form-group">
            <label class="form-label">Password <span>*</span></label>
            <div class="input-group">
              <input class="form-control" formControlName="password"
                [type]="showPass ? 'text' : 'password'" placeholder="Min 6 characters">
              <span class="input-icon" (click)="showPass = !showPass">{{ showPass ? '🙈' : '👁' }}</span>
            </div>
            <div class="form-error" *ngIf="f['password'].touched && f['password'].errors?.['minlength']">Min 6 characters</div>
          </div>

          <div class="form-group">
            <label class="form-label">Profile Photo</label>
            <input type="file" class="form-control" (change)="onFileChange($event)" accept="image/*">
            <div class="form-hint">JPEG, PNG or WebP, max 5MB</div>
            <div *ngIf="photoPreview" style="margin-top:10px">
              <img [src]="photoPreview" alt="Preview"
                style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--border)">
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" [disabled]="loading || form.invalid">
            <span *ngIf="loading" class="spinner spinner-sm"></span>
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p style="text-align:center;margin-top:20px;font-size:0.88rem;color:var(--text2)">
          Already registered?
          <a routerLink="/login" style="color:var(--blue-main);font-weight:600">Sign in</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';
  showPass = false;
  photoFile: File | null = null;
  photoPreview: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name:       ['', Validators.required],
      employeeId: ['', Validators.required],
      country:    ['', Validators.required],
      salary:     ['', [Validators.required, Validators.min(0)]],
      role:       ['Developer'],
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.form.controls; }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = () => this.photoPreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';

    const values = { ...this.form.value, employeeId: this.form.value.employeeId.toUpperCase() };
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v as string));
    if (this.photoFile) fd.append('photo', this.photoFile);

    this.auth.register(fd).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = 'Account created! Redirecting...';
          setTimeout(() => this.router.navigate(['/dashboard']), 1000);
        } else {
          this.errorMsg = res.message;
          this.loading = false;
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.message || err.message || 'Registration failed.';
        console.error('Register error:', err);
        this.loading = false;
      }
    });
  }
}
