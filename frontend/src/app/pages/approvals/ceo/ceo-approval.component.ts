import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-ceo-approval',
  template: `
    <div class="slide-up">
      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
      <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

      <div *ngIf="!loading && expenses.length === 0" class="empty-state">
        <div style="font-size:2.5rem;margin-bottom:12px">★</div>
        <h3>Nothing pending</h3>
        <p>No expenses awaiting CEO approval.</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:20px" *ngIf="!loading">
        <div *ngFor="let e of expenses" class="approval-card">
          <div class="ceo-badge">Final Approval — CEO</div>

          <div class="approval-header">
            <div>
              <h3>{{ e.employeeName }}</h3>
              <p style="font-size:0.82rem">{{ e.employeeCode }} · {{ e.country }} · Salary: \${{ e.salary | number }}</p>
            </div>
            <div style="text-align:right">
              <div class="amount">\${{ e.amount | number }}</div>
              <span class="badge" [ngClass]="'badge-' + e.priority.toLowerCase()" style="margin-top:6px;display:inline-block">
                {{ e.priority }}
              </span>
            </div>
          </div>

          <div class="approval-body">
            <div class="detail-row"><span>Reason</span><span>{{ e.reason }}</span></div>
            <div class="detail-row"><span>Order #</span><span>{{ e.order }}</span></div>
            <div class="detail-row"><span>Country</span><span>{{ e.country }}</span></div>
            <div class="detail-row"><span>Manager Decision</span>
              <span class="badge badge-approved">{{ e.managerDecision?.decision }}</span></div>
            <div class="detail-row"><span>Finance Decision</span>
              <span class="badge badge-approved">{{ e.financeDecision?.decision }}</span></div>
            <div class="detail-row"><span>Expected CEO Decision</span>
              <span class="badge" [class.badge-approved]="autoDecision(e) === 'Approved'"
                [class.badge-rejected]="autoDecision(e) === 'Rejected'">
                {{ autoDecision(e) }} (rule-based)
              </span>
            </div>
          </div>

          <!-- Full approval pipeline visual -->
          <div class="timeline" style="margin:16px 0">
            <div class="timeline-item">
              <div class="timeline-dot approved">✓</div>
              <div class="timeline-body">
                <div class="timeline-title">Manager Approved</div>
                <div class="timeline-meta">{{ e.managerDecision?.remarks || 'No remarks' }}</div>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot approved">✓</div>
              <div class="timeline-body">
                <div class="timeline-title">Finance Approved</div>
                <div class="timeline-meta">{{ e.financeDecision?.remarks || 'Auto-approved by policy' }}</div>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot active">★</div>
              <div class="timeline-body">
                <div class="timeline-title">CEO Decision — Pending</div>
                <div class="timeline-meta">Awaiting your approval</div>
              </div>
            </div>
          </div>

          <div class="approval-form" *ngIf="e._id !== processingId">
            <input [(ngModel)]="e._remarks" class="form-control" placeholder="Remarks (optional)" style="flex:1">
            <button class="btn btn-success btn-sm" (click)="decide(e, 'Approved')">★ Approve</button>
            <button class="btn btn-danger  btn-sm" (click)="decide(e, 'Rejected')">✗ Reject</button>
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
    .ceo-badge {
      display: inline-flex; align-items: center;
      background: linear-gradient(135deg, rgba(23,82,232,0.1), rgba(56,189,248,0.1));
      border: 1px solid rgba(23,82,232,0.2); color: var(--blue-main);
      font-size: 0.72rem; font-weight: 700; padding: 3px 10px;
      border-radius: 100px; margin-bottom: 14px;
    }
    .approval-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .amount { font-family: var(--font-head); font-size: 1.6rem; font-weight: 800; color: var(--blue-main); }
    .approval-body { background: var(--bg2); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 4px; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 0.85rem; }
    .detail-row span:first-child { color: var(--text2); }
    .detail-row span:last-child  { font-weight: 600; color: var(--text); }
    .approval-form { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid var(--border); }
    .empty-state { text-align: center; padding: 64px 24px; color: var(--text2); }
  `]
})
export class CeoApprovalComponent implements OnInit {
  expenses: any[] = [];
  loading = true;
  processingId: string | null = null;
  successMsg = '';
  errorMsg = '';

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getPendingCEO().subscribe(res => {
      if (res.success) this.expenses = res.data.map((e: any) => ({ ...e, _remarks: '' }));
      this.loading = false;
    });
  }

  autoDecision(e: any): string {
    const { priority, order, country, salary } = e;
    if (priority === 'High') return 'Approved';
    if (priority === 'Medium' && order === 1) return 'Approved';
    if (priority === 'Medium' && order === 2 && country === 'India' && salary >= 100000) return 'Approved';
    return 'Rejected';
  }

  decide(e: any, decision: string): void {
    this.processingId = e._id;
    this.successMsg = ''; this.errorMsg = '';
    this.api.ceoDecision(e._id, { decision, remarks: e._remarks }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = `CEO decision applied: ${res.message}`;
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
