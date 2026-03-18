import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-expense',
  template: `
    <div class="slide-up">
      <div class="grid-2" style="gap:24px;align-items:start">

        <!-- Submit Form -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">New Expense Request</div>
            <div class="card-sub">Submit your expense for manager review</div>
          </div>

          <!-- Auto-filled employee info -->
          <div class="employee-info-box">
            <div class="info-grid">
              <div><span class="label">Name</span><span class="val">{{ user?.name }}</span></div>
              <div><span class="label">Employee ID</span><span class="val">{{ user?.employeeId }}</span></div>
              <div><span class="label">Country</span><span class="val">{{ user?.country }}</span></div>
              <div><span class="label">Salary</span><span class="val">\${{ user?.salary | number }}</span></div>
              <div><span class="label">Request #</span><span class="val">Order {{ nextOrder }}</span></div>
            </div>
          </div>

          <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
          <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

          <!-- Priority preview -->
          <div class="priority-preview" *ngIf="priorityPreview">
            <div class="preview-label">Estimated Priority</div>
            <span class="badge" [ngClass]="'badge-' + priorityPreview.toLowerCase()">
              {{ priorityPreview }}
            </span>
            <div class="preview-hint">Based on amount, country and salary</div>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">Amount (USD) <span>*</span></label>
              <input class="form-control" formControlName="amount" type="number"
                placeholder="e.g. 25000" min="1" (input)="calcPriorityPreview()">
              <div class="form-error" *ngIf="f['amount'].touched && f['amount'].errors?.['required']">Amount is required</div>
              <div class="form-error" *ngIf="f['amount'].touched && f['amount'].errors?.['min']">Amount must be > 0</div>
            </div>
            <div class="form-group">
              <label class="form-label">Reason <span>*</span></label>
              <textarea class="form-control" formControlName="reason" rows="4"
                placeholder="Describe the business purpose of this expense..."></textarea>
              <div class="form-error" *ngIf="f['reason'].touched && f['reason'].errors?.['required']">Reason is required</div>
            </div>
            <button type="submit" class="btn btn-primary btn-full" [disabled]="loading || form.invalid">
              <span *ngIf="loading" class="spinner spinner-sm"></span>
              {{ loading ? 'Submitting...' : 'Submit Expense Request' }}
            </button>
          </form>
        </div>

        <!-- My Expenses List -->
        <div class="card">
          <div class="card-header flex-between">
            <div>
              <div class="card-title">My Expense Requests</div>
              <div class="card-sub">{{ expenses.length }} total requests</div>
            </div>
          </div>

          <div *ngIf="loadingList" class="loading-overlay"><div class="spinner"></div></div>

          <div *ngIf="!loadingList" style="display:flex;flex-direction:column;gap:12px">
            <div *ngFor="let e of expenses" class="expense-item" (click)="viewResult(e)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <div style="font-weight:700;font-size:1rem;color:var(--text)">\${{ e.amount | number }}</div>
                  <div style="font-size:0.8rem;color:var(--text2);margin-top:2px">{{ e.reason }}</div>
                </div>
                <div style="text-align:right">
                  <span class="badge"
                    [class.badge-approved]="e.finalStatus === 'Approved'"
                    [class.badge-rejected]="e.finalStatus === 'Rejected'"
                    [class.badge-progress]="e.finalStatus === 'In Progress'">
                    {{ e.finalStatus }}
                  </span>
                  <div style="font-size:0.72rem;color:var(--text3);margin-top:4px">{{ e.createdAt | date:'mediumDate' }}</div>
                </div>
              </div>
              <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
                <span class="meta-chip">Stage: {{ e.currentStage }}</span>
                <span class="meta-chip">Order #{{ e.order }}</span>
                <span *ngIf="e.priority !== 'Pending'" class="badge"
                  [ngClass]="'badge-' + e.priority.toLowerCase()">{{ e.priority }}</span>
              </div>
            </div>

            <div *ngIf="expenses.length === 0" style="text-align:center;padding:32px;color:var(--text3)">
              No expense requests yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .employee-info-box {
      background: var(--bg3); border: 1px solid rgba(23,82,232,0.15);
      border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 20px;
    }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .info-grid .label { font-size: 0.72rem; color: var(--text2); display: block; }
    .info-grid .val   { font-size: 0.85rem; font-weight: 600; color: var(--text); }
    .priority-preview {
      background: rgba(23,82,232,0.04); border: 1px solid rgba(23,82,232,0.15);
      border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px;
      display: flex; align-items: center; gap: 12px;
    }
    .preview-label { font-size: 0.8rem; font-weight: 600; color: var(--text2); }
    .preview-hint  { font-size: 0.75rem; color: var(--text3); margin-left: auto; }
    .expense-item {
      padding: 14px; background: var(--bg2); border: 1px solid var(--border);
      border-radius: var(--radius-md); cursor: pointer; transition: all .2s;
    }
    .expense-item:hover { border-color: var(--blue-main); background: var(--bg3); }
    .meta-chip {
      background: var(--surface); border: 1px solid var(--border);
      padding: 2px 8px; border-radius: 100px; font-size: 0.72rem; color: var(--text2);
    }
  `]
})
export class ExpenseComponent implements OnInit {
  form: FormGroup;
  expenses: any[] = [];
  loading = false;
  loadingList = true;
  successMsg = '';
  errorMsg = '';
  nextOrder = 1;
  priorityPreview: string | null = null;
  user: any = null;

  get f() { return this.form.controls; }

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    public auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required]
    });
    this.auth.currentUser$.subscribe(u => this.user = u);
  }

  ngOnInit(): void { this.loadExpenses(); }

  loadExpenses(): void {
    this.api.getMyExpenses().subscribe(res => {
      if (res.success) {
        this.expenses = res.data;
        this.nextOrder = res.data.length + 1;
      }
      this.loadingList = false;
    });
  }

  calcPriorityPreview(): void {
    const amount = Number(this.form.value.amount);
    const country = this.user?.country || '';
    const salary = this.user?.salary || 0;
    if (!amount) { this.priorityPreview = null; return; }

    if (country === 'India') {
      if (amount > 10000 && amount <= 100000 && salary >= 100000) { this.priorityPreview = 'High'; return; }
      if (amount > 5000  && amount <= 50000  && salary >= 80000)  { this.priorityPreview = 'Medium'; return; }
      if (amount > 5000  && amount <= 35000  && salary >= 50000)  { this.priorityPreview = 'Low'; return; }
    }
    if (country === 'US') {
      if (amount > 10000 && amount <= 80000  && salary >= 150000) { this.priorityPreview = 'High'; return; }
      if (amount > 8000  && amount <= 50000  && salary >= 100000) { this.priorityPreview = 'Medium'; return; }
      if (amount > 5000  && amount <= 40000  && salary >= 80000)  { this.priorityPreview = 'Low'; return; }
    }
    this.priorityPreview = 'Default';
  }

  viewResult(e: any): void {
    if (e.finalStatus !== 'In Progress') this.router.navigate(['/expense', e._id, 'result']);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.errorMsg = ''; this.successMsg = '';

    this.api.submitExpense(this.form.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = 'Expense submitted! Manager will review it shortly.';
          this.form.reset(); this.priorityPreview = null;
          this.loadExpenses();
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
