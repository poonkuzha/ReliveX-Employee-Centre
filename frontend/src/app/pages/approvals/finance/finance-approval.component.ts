import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-finance-approval',
  template: `
    <div class="slide-up">
      <div class="alert alert-info" style="margin-bottom:20px">
        Finance decisions are auto-calculated based on the priority engine and expense order. You can add remarks before processing.
      </div>

      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
      <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

      <div *ngIf="!loading && expenses.length === 0" class="empty-state">
        <div style="font-size:2.5rem;margin-bottom:12px">◎</div>
        <h3>Queue is clear</h3>
        <p>No expenses awaiting Finance review.</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:20px" *ngIf="!loading">
        <div *ngFor="let e of expenses" class="approval-card">
          <div class="approval-header">
            <div>
              <h3>{{ e.employeeName }}</h3>
              <p style="font-size:0.82rem">{{ e.employeeCode }} · {{ e.country }} · Salary: \${{ e.salary | number }}</p>
            </div>
            <div style="text-align:right">
              <div class="amount">\${{ e.amount | number }}</div>
              <div style="margin-top:4px">
                <span class="badge" [ngClass]="'badge-' + e.priority.toLowerCase()">{{ e.priority }}</span>
              </div>
            </div>
          </div>

          <div class="approval-body">
            <div class="detail-row"><span>Reason</span><span>{{ e.reason }}</span></div>
            <div class="detail-row"><span>Order #</span><span>{{ e.order }}</span></div>
            <div class="detail-row"><span>Manager Decision</span>
              <span class="badge badge-approved">{{ e.managerDecision?.decision }}</span>
            </div>
            <div class="detail-row"><span>Expected Finance Decision</span>
              <span class="badge" [class.badge-approved]="autoDecision(e) === 'Approved'"
                [class.badge-rejected]="autoDecision(e) === 'Rejected'">
                {{ autoDecision(e) }} (auto)
              </span>
            </div>
          </div>

          <div class="approval-form" *ngIf="e._id !== processingId">
            <input [(ngModel)]="e._remarks" class="form-control" placeholder="Remarks (optional)" style="flex:1">
            <button class="btn btn-primary btn-sm" (click)="process(e)">
              ◎ Process Finance Decision
            </button>
          </div>
          <div *ngIf="e._id === processingId" style="display:flex;align-items:center;gap:8px;padding-top:12px">
            <div class="spinner spinner-sm"></div><span style="font-size:0.85rem;color:var(--text2)">Processing...</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .approval-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 22px; box-shadow: var(--card-shadow);
    }
    .approval-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .amount { font-family: var(--font-head); font-size: 1.6rem; font-weight: 800; color: var(--blue-main); }
    .approval-body { background: var(--bg2); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 0.85rem; }
    .detail-row span:first-child { color: var(--text2); }
    .detail-row span:last-child  { font-weight: 600; color: var(--text); }
    .approval-form { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid var(--border); }
    .empty-state { text-align: center; padding: 64px 24px; color: var(--text2); }
  `]
})
export class FinanceApprovalComponent implements OnInit {
  expenses: any[] = [];
  loading = true;
  processingId: string | null = null;
  successMsg = '';
  errorMsg = '';

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getPendingFinance().subscribe(res => {
      if (res.success) this.expenses = res.data.map((e: any) => ({ ...e, _remarks: '' }));
      this.loading = false;
    });
  }

  autoDecision(e: any): string {
    const { priority, order } = e;
    if (priority === 'High')                      return 'Approved';
    if (priority === 'Medium' && order <= 2)      return 'Approved';
    if (priority === 'Low'    && order === 1)     return 'Approved';
    return 'Rejected';
  }

  process(e: any): void {
    this.processingId = e._id;
    this.successMsg = ''; this.errorMsg = '';
    this.api.financeDecision(e._id, { remarks: e._remarks }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = `Finance decision applied: ${res.message}`;
          this.expenses = this.expenses.filter(x => x._id !== e._id);
        }
        this.processingId = null;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Action failed.';
        this.processingId = null;
      }
    });
  }
}
