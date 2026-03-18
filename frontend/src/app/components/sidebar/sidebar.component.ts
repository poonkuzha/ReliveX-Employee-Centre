import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="sidebar">
      <div class="sidebar-logo">
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
      

      <nav class="sidebar-nav">
        <div class="nav-section-title">Main</div>

        <a class="nav-item" routerLink="/dashboard" routerLinkActive="active">
          <span class="nav-icon">⊞</span> Dashboard
        </a>
        <a class="nav-item" routerLink="/profile" routerLinkActive="active">
          <span class="nav-icon">◉</span> Profile
        </a>
        <a class="nav-item" routerLink="/career" routerLinkActive="active">
          <span class="nav-icon">◈</span> Career
        </a>
        <a class="nav-item" routerLink="/query" routerLinkActive="active">
          <span class="nav-icon">✉</span> Query
        </a>
        <a class="nav-item" routerLink="/expense" routerLinkActive="active">
          <span class="nav-icon">◑</span> Expense Request
        </a>

        <!-- Manager only -->
        <ng-container *ngIf="isManager">
          <div class="nav-section-title" style="margin-top:12px">Approvals</div>
          <a class="nav-item" routerLink="/approvals/manager" routerLinkActive="active">
            <span class="nav-icon">✓</span> Manager Approval
          </a>
        </ng-container>

        <!-- Finance only -->
        <ng-container *ngIf="isFinance">
          <div class="nav-section-title" style="margin-top:12px">Approvals</div>
          <a class="nav-item" routerLink="/approvals/finance" routerLinkActive="active">
            <span class="nav-icon">◎</span> Finance Approval
          </a>
        </ng-container>

        <!-- CEO only -->
        <ng-container *ngIf="isCEO">
          <div class="nav-section-title" style="margin-top:12px">Approvals</div>
          <a class="nav-item" routerLink="/approvals/ceo" routerLinkActive="active">
            <span class="nav-icon">★</span> CEO Approval
          </a>
        </ng-container>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user" (click)="logout()">
          <div class="user-avatar">
            <img *ngIf="user?.photo" [src]="'http://localhost:5000' + user?.photo" alt="avatar">
            <span *ngIf="!user?.photo">{{ initials }}</span>
          </div>
          <div class="user-info">
            <div class="user-name">{{ user?.name }}</div>
            <div class="user-role">{{ displayRole }} · Sign out</div>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  user: User | null = null;
  initials = '';

  get displayRole(): string {
    if (!this.user?.role) return 'Developer';
    return this.user.role === 'Employee' ? 'Developer' : this.user.role;
  }

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(u => {
      this.user = u;
      this.initials = this.auth.getInitials(u?.name || '');
    });
  }

  get isManager(): boolean { return this.auth.hasRole('Manager'); }
  get isFinance(): boolean { return this.auth.hasRole('Finance'); }
  get isCEO(): boolean     { return this.auth.hasRole('CEO'); }

  logout(): void { this.auth.logout(); }
}
