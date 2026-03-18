import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  template: `
    <div class="slide-up">
      <div class="grid-2" style="gap:24px;align-items:start">

        <!-- Profile Card -->
        <div class="card" style="text-align:center">
          <div class="avatar-wrap">
            <div class="big-avatar">
              <img *ngIf="employee?.photo" [src]="apiBase + employee.photo" alt="Photo">
              <span *ngIf="!employee?.photo">{{ initials }}</span>
            </div>
            <div class="avatar-badge">{{ displayRole }}</div>
          </div>
          <h2 style="margin-top:16px">{{ employee?.name }}</h2>
          <p style="margin-bottom:20px">{{ employee?.email }}</p>

          <div class="info-list">
            <div class="info-row">
              <span class="info-label">Developer ID</span>
              <span class="info-val">{{ employee?.employeeId }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Country</span>
              <span class="info-val">{{ employee?.country }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Annual Salary</span>
              <span class="info-val">\${{ employee?.salary | number }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Role</span>
              <span class="info-val">
                <span class="badge badge-progress">{{ displayRole }}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Member since</span>
              <span class="info-val">{{ employee?.createdAt | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Edit Profile</div>
            <div class="card-sub">Update your personal information</div>
          </div>

          <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
          <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input class="form-control" formControlName="name" placeholder="Your full name">
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input class="form-control" formControlName="email" type="email">
              <div class="form-error" *ngIf="f['email'].touched && f['email'].errors?.['email']">
                Invalid email format
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Country</label>
              <select class="form-control" formControlName="country">
                <option value="India">India</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Annual Salary</label>
              <input class="form-control" type="number" formControlName="salary" min="0" placeholder="Annual salary">
            </div>

            <div class="form-group">
              <label class="form-label">Profile Photo</label>
              <input type="file" class="form-control" (change)="onFileChange($event)" accept="image/*">
              <div *ngIf="photoPreview" style="margin-top:10px">
                <img [src]="photoPreview" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid var(--border)">
              </div>
            </div>

            <div style="display:flex;gap:12px">
              <button type="submit" class="btn btn-primary" [disabled]="loading || form.invalid">
                <span *ngIf="loading" class="spinner spinner-sm"></span>
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
              <button type="button" class="btn btn-outline" (click)="resetForm()">Reset</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-wrap { position: relative; display: inline-block; }
    .big-avatar {
      width: 100px; height: 100px; border-radius: 50%; margin: 0 auto;
      background: linear-gradient(135deg, var(--blue-main), var(--blue-sky));
      display: flex; align-items: center; justify-content: center;
      color: white; font-family: var(--font-head); font-weight: 800; font-size: 2rem;
      overflow: hidden;
    }
    .big-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-badge {
      position: absolute; bottom: 0; right: -4px;
      background: var(--blue-main); color: white;
      font-size: 0.65rem; font-weight: 700; padding: 2px 8px;
      border-radius: 100px; border: 2px solid var(--surface);
    }
    .info-list { text-align: left; }
    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0; border-bottom: 1px solid var(--border);
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 0.82rem; color: var(--text2); font-weight: 500; }
    .info-val   { font-size: 0.85rem; font-weight: 600; color: var(--text); }
  `]
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  employee: any = null;
  loading = false;
  successMsg = '';
  errorMsg = '';
  photoFile: File | null = null;
  photoPreview: string | null = null;
  initials = '';
  apiBase = 'http://localhost:5000';

  constructor(private fb: FormBuilder, private api: ApiService, public auth: AuthService) {
    this.form = this.fb.group({
      name:    ['', Validators.required],
      email:   ['', [Validators.required, Validators.email]],
      country: [''],
      salary:  [0, [Validators.required, Validators.min(0)]]
    });
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.api.getProfile().subscribe(res => {
      if (res.success) {
        this.employee = res.data;
        this.initials = this.auth.getInitials(res.data.name);
        this.form.patchValue({
          name: res.data.name,
          email: res.data.email,
          country: res.data.country
        });
      }
    });
  }

  onFileChange(e: any): void {
    const file = e.target.files[0];
    if (!file) return;
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = () => this.photoPreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  get displayRole(): string {
    if (!this.employee?.role) return 'Developer';
    return this.employee.role === 'Employee' ? 'Developer' : this.employee.role;
  }

  resetForm(): void {
    if (!this.employee) return;
    this.form.patchValue({
      name: this.employee.name,
      email: this.employee.email,
      country: this.employee.country,
      salary: this.employee.salary || 0
    });
    this.photoFile = null; this.photoPreview = null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true; this.errorMsg = ''; this.successMsg = '';

    const fd = new FormData();
    fd.append('name', this.form.value.name);
    fd.append('email', this.form.value.email);
    fd.append('country', this.form.value.country);
    fd.append('salary', String(this.form.value.salary));
    if (this.photoFile) fd.append('photo', this.photoFile);

    this.api.updateProfile(fd).subscribe({
      next: (res) => {
        if (res.success) {
          this.api.getProfile().subscribe((refreshRes: any) => {
            if (refreshRes.success) {
              this.employee = refreshRes.data;
              this.auth.updateCurrentUser(refreshRes.data);
              this.form.patchValue({
                name: refreshRes.data.name || '',
                email: refreshRes.data.email || '',
                country: refreshRes.data.country || '',
                salary: refreshRes.data.salary || 0
              });
            }
          });
          this.successMsg = 'Profile updated successfully!';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Update failed.';
        this.loading = false;
      }
    });
  }
}
