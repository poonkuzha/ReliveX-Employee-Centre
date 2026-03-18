import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-approval-result',
  template: `
    <div class="slide-up" style="max-width:640px;margin:0 auto">
      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div *ngIf="!loading && expense" class="result-card" [class.approved]="isApproved" [class.rejected]="!isApproved">

        <!-- Status Header -->
        <div class="result-header">
          <div class="result-icon">{{ isApproved ? '✅' : '❌' }}</div>
          <h2>{{ isApproved ? 'Expense Approved' : 'Expense Rejected' }}</h2>
          <p>{{ isApproved
            ? 'Your expense request has been fully approved through all stages.'
            : 'Your expense request was not approved at one or more stages.' }}
          </p>
        </div>

        <!-- Employee Details -->
        <div class="result-section">
          <div class="result-label">Employee Details</div>
          <div class="result-grid">
            <div class="result-item"><span>Name</span><span>{{ expense.employeeName }}</span></div>
            <div class="result-item"><span>Employee ID</span><span>{{ expense.employeeCode }}</span></div>
            <div class="result-item"><span>Country</span><span>{{ expense.country }}</span></div>
            <div class="result-item"><span>Salary</span><span>\${{ expense.salary | number }}</span></div>
          </div>
        </div>

        <!-- Expense Details -->
        <div class="result-section">
          <div class="result-label">Expense Details</div>
          <div class="result-grid">
            <div class="result-item"><span>Amount</span>
              <span style="font-size:1.2rem;font-weight:800;color:var(--blue-main)">\${{ expense.amount | number }}</span>
            </div>
            <div class="result-item"><span>Priority</span>
              <span class="badge" [ngClass]="'badge-' + expense.priority.toLowerCase()">{{ expense.priority }}</span>
            </div>
            <div class="result-item"><span>Order #</span><span>{{ expense.order }}</span></div>
            <div class="result-item"><span>Reason</span><span>{{ expense.reason }}</span></div>
          </div>
        </div>

        <!-- Approved: dates -->
        <div class="result-section" *ngIf="isApproved">
          <div class="result-label">Approval Validity</div>
          <div class="result-grid">
            <div class="result-item">
              <span>Approved Date</span>
              <span>{{ expense.approvedDate | date:'longDate' }}</span>
            </div>
            <div class="result-item">
              <span>Valid Until</span>
              <span style="color:var(--success);font-weight:600">{{ expense.expiryDate | date:'longDate' }}</span>
            </div>
          </div>
          <div class="validity-bar">
            <div class="validity-fill"></div>
          </div>
          <p style="font-size:0.78rem;color:var(--text3);margin-top:6px">Valid for 1 year from approval date</p>
        </div>

        <!-- Rejected: reason -->
        <div class="result-section" *ngIf="!isApproved">
          <div class="result-label">Rejection Reason</div>
          <div class="rejection-box">{{ expense.rejectionReason || 'Not specified' }}</div>
        </div>

        <!-- Approval Timeline -->
        <div class="result-section">
          <div class="result-label">Approval Pipeline</div>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-dot" [ngClass]="stageClass(expense.managerDecision?.decision)">
                {{ stageIcon(expense.managerDecision?.decision) }}
              </div>
              <div class="timeline-body">
                <div class="timeline-title">Manager</div>
                <div class="timeline-meta">
                  {{ expense.managerDecision?.decision || 'Pending' }}
                  <span *ngIf="expense.managerDecision?.remarks"> · {{ expense.managerDecision.remarks }}</span>
                </div>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot" [ngClass]="stageClass(expense.financeDecision?.decision)">
                {{ stageIcon(expense.financeDecision?.decision) }}
              </div>
              <div class="timeline-body">
                <div class="timeline-title">Finance</div>
                <div class="timeline-meta">{{ expense.financeDecision?.decision || 'Pending' }}</div>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot" [ngClass]="stageClass(expense.ceoDecision?.decision)">
                {{ stageIcon(expense.ceoDecision?.decision) }}
              </div>
              <div class="timeline-body">
                <div class="timeline-title">CEO</div>
                <div class="timeline-meta">{{ expense.ceoDecision?.decision || 'Pending' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:12px;margin-top:8px">
          <button class="btn btn-primary" (click)="router.navigate(['/expense'])">← Back to Expenses</button>
          <button class="btn btn-outline" (click)="router.navigate(['/dashboard'])">Dashboard</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .result-card {
      background: var(--surface); border-radius: var(--radius-xl);
      border: 1px solid var(--border); overflow: hidden;
      box-shadow: 0 8px 48px rgba(23,82,232,0.08);
    }
    .result-header {
      padding: 32px; text-align: center;
      background: linear-gradient(135deg, var(--bg2), var(--bg3));
      border-bottom: 1px solid var(--border);
    }
    .result-card.approved .result-header { background: linear-gradient(135deg, rgba(22,163,74,0.06), rgba(22,163,74,0.02)); }
    .result-card.rejected .result-header { background: linear-gradient(135deg, rgba(220,38,38,0.06), rgba(220,38,38,0.02)); }
    .result-icon { font-size: 2.5rem; margin-bottom: 12px; }
    .result-section { padding: 20px 28px; border-bottom: 1px solid var(--border); }
    .result-section:last-of-type { border-bottom: none; }
    .result-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); margin-bottom: 14px; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .result-item { display: flex; flex-direction: column; gap: 3px; }
    .result-item span:first-child { font-size: 0.75rem; color: var(--text2); }
    .result-item span:last-child  { font-size: 0.9rem; font-weight: 600; color: var(--text); }
    .validity-bar {
      height: 6px; background: var(--bg3); border-radius: 100px;
      margin-top: 12px; overflow: hidden;
    }
    .validity-fill { height: 100%; width: 100%; background: linear-gradient(90deg, var(--blue-main), var(--blue-sky)); border-radius: 100px; }
    .rejection-box {
      background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15);
      border-left: 3px solid var(--danger); padding: 12px 16px;
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      font-size: 0.88rem; color: var(--text);
    }
    .result-card > div:last-child { padding: 24px 28px; }
  `]
})
export class ApprovalResultComponent implements OnInit {
  expense: any = null;
  loading = true;

  constructor(private route: ActivatedRoute, public router: Router, private api: ApiService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getExpenseById(id).subscribe(res => {
        if (res.success) this.expense = res.data;
        this.loading = false;
      });
    }
  }

  get isApproved(): boolean { return this.expense?.finalStatus === 'Approved'; }

  stageClass(decision: string): string {
    if (decision === 'Approved') return 'approved';
    if (decision === 'Rejected') return 'rejected';
    return 'pending';
  }

  stageIcon(decision: string): string {
    if (decision === 'Approved') return '✓';
    if (decision === 'Rejected') return '✗';
    return '·';
  }
}
