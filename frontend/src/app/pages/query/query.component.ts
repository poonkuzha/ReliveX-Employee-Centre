import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-query',
  template: `
    <div class="slide-up">
      <div class="grid-2" style="gap:24px;align-items:start">

        <!-- Submit Form -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Submit a Query</div>
            <div class="card-sub">Raise a question or report an issue to the admin team</div>
          </div>

          <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
          <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">Subject <span>*</span></label>
              <input class="form-control" formControlName="subject" placeholder="e.g. Leave balance query">
              <div class="form-error" *ngIf="f['subject'].touched && f['subject'].errors?.['required']">
                Subject is required
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Message <span>*</span></label>
              <textarea class="form-control" formControlName="message" rows="5"
                placeholder="Describe your query in detail..."></textarea>
              <div class="form-error" *ngIf="f['message'].touched && f['message'].errors?.['required']">
                Message is required
              </div>
              <div class="form-hint">{{ form.value.message?.length || 0 }}/500 characters</div>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="loading || form.invalid">
              <span *ngIf="loading" class="spinner spinner-sm"></span>
              {{ loading ? 'Submitting...' : 'Submit Query' }}
            </button>
          </form>
        </div>

        <!-- Query History -->
        <div class="card">
          <div class="card-header flex-between">
            <div>
              <div class="card-title">My Queries</div>
              <div class="card-sub">Track your submitted queries</div>
            </div>
            <span class="badge badge-progress">{{ queries.length }}</span>
          </div>

          <div *ngIf="loadingQueries" class="loading-overlay"><div class="spinner"></div></div>

          <div *ngIf="!loadingQueries" style="display:flex;flex-direction:column;gap:12px">
            <div *ngFor="let q of queries" class="query-item">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                <div style="font-weight:600;font-size:0.88rem;color:var(--text)">{{ q.subject }}</div>
                <span class="badge"
                  [class.badge-approved]="q.status === 'Resolved'"
                  [class.badge-progress]="q.status === 'In Review'"
                  [class.badge-pending]="q.status === 'Open'">
                  {{ q.status }}
                </span>
              </div>
              <p style="font-size:0.8rem;margin-bottom:8px">{{ q.message }}</p>
              <div *ngIf="q.adminResponse" class="admin-response">
                <strong>Admin:</strong> {{ q.adminResponse }}
              </div>
              <div style="font-size:0.72rem;color:var(--text3)">{{ q.createdAt | date:'medium' }}</div>
            </div>

            <div *ngIf="queries.length === 0" style="text-align:center;padding:32px;color:var(--text3)">
              No queries submitted yet.
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .query-item {
      padding: 14px; background: var(--bg2); border: 1px solid var(--border);
      border-radius: var(--radius-md); transition: border-color .2s;
    }
    .query-item:hover { border-color: var(--blue-light); }
    .admin-response {
      background: rgba(23,82,232,0.06); border-left: 3px solid var(--blue-main);
      padding: 8px 12px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      font-size: 0.8rem; color: var(--text); margin-bottom: 8px;
    }
  `]
})
export class QueryComponent implements OnInit {
  form: FormGroup;
  queries: any[] = [];
  loading = false;
  loadingQueries = true;
  successMsg = '';
  errorMsg = '';

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.loadQueries();
  }

  loadQueries(): void {
    this.api.getMyQueries().subscribe(res => {
      if (res.success) this.queries = res.data;
      this.loadingQueries = false;
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.errorMsg = ''; this.successMsg = '';

    this.api.submitQuery(this.form.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = 'Query submitted successfully! Admin will respond shortly.';
          this.form.reset();
          this.loadQueries();
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Submission failed.';
        this.loading = false;
      }
    });
  }
}
