import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
         templateUrl: './dashboard.component.html',
         styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    getStageClass(decision: string): string {
      if (decision === 'Approved') return 'stage-green';
      if (decision === 'Rejected') return 'stage-red';
      return 'stage-blue'; // Pending or undefined
    }
  user: User | null = null;
  stats: any = {};
  notifications: any[] = [];
  loading = true;

  constructor(public auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    this.api.getDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.data.stats;
          this.notifications = res.data.notifications;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get isDeveloper(): boolean { return this.user?.role === 'Developer' || this.user?.role === 'Employee'; }
  get isManager(): boolean  { return this.user?.role === 'Manager'; }
  get isFinance(): boolean  { return this.user?.role === 'Finance'; }
  get isCEO(): boolean      { return this.user?.role === 'CEO'; }
  get hasApprovalRole(): boolean { return this.isManager || this.isFinance || this.isCEO; }

  get pendingLabel(): string {
    if (this.isManager) return 'Manager Pending Work';
    if (this.isFinance) return 'Finance Pending Work';
    if (this.isCEO) return 'CEO Pending Work';
    return '';
  }

  get displayRole(): string {
    if (!this.user?.role) return 'Developer';
    return this.user.role === 'Employee' ? 'Developer' : this.user.role;
  }

  getFirstName(): string {
    return this.user?.name?.split(' ')[0] || 'User';
  }

  nav(path: string): void { this.router.navigate([path]); }
}
