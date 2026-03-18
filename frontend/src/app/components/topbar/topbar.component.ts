import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-topbar',
  template: `
    <div class="topbar">
      <div class="topbar-left">
        <h2>{{ pageTitle }}</h2>
        <p>{{ pageSubtitle }}</p>
      </div>
      <div class="topbar-right">
        <div class="notif-btn" (click)="toggleNotifs()">
          🔔
          <span class="notif-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
        </div>

        <!-- Notifications dropdown -->
        <div class="notif-dropdown" *ngIf="showNotifs">
          <div class="notif-header">
            <span>Notifications</span>
            <button class="btn btn-sm" (click)="markAll()">Mark all read</button>
          </div>
          <div class="notif-list">
            <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.read" (click)="markOne(n)">
              <div class="notif-icon" [ngClass]="n.type">💬</div>
              <div class="notif-body">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-msg">{{ n.message }}</div>
                <div class="notif-time">{{ n.createdAt | date:'short' }}</div>
              </div>
            </div>
            <div *ngIf="notifications.length === 0" class="notif-empty">No new notifications</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-dropdown {
      position: absolute; top: 64px; right: 24px; width: 340px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      z-index: 200; overflow: hidden;
    }
    .notif-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-bottom: 1px solid var(--border);
      font-weight: 600; font-size: 0.9rem;
    }
    .notif-list { max-height: 340px; overflow-y: auto; }
    .notif-item {
      display: flex; gap: 12px; padding: 12px 16px;
      border-bottom: 1px solid var(--border); cursor: pointer; transition: background .2s;
    }
    .notif-item:hover { background: var(--bg2); }
    .notif-item.unread { background: rgba(23,82,232,0.03); border-left: 3px solid var(--blue-main); }
    .notif-icon { font-size: 1.2rem; }
    .notif-title { font-size: 0.82rem; font-weight: 600; color: var(--text); }
    .notif-msg   { font-size: 0.78rem; color: var(--text2); margin-top: 2px; line-height: 1.4; }
    .notif-time  { font-size: 0.72rem; color: var(--text3); margin-top: 4px; }
    .notif-empty { padding: 24px; text-align: center; color: var(--text3); font-size: 0.85rem; }
    .topbar { position: relative; }
  `]
})
export class TopbarComponent implements OnInit {
  pageTitle = 'Dashboard';
  pageSubtitle = '';
  notifications: any[] = [];
  unreadCount = 0;
  showNotifs = false;

  private pageMap: Record<string, { title: string; sub: string }> = {
    '/dashboard':         { title: 'Dashboard',          sub: 'Welcome back to your workspace' },
    '/profile':           { title: 'My Profile',         sub: 'View and update your information' },
    '/career':            { title: 'Career',             sub: 'Explore opportunities at Relivex' },
    '/query':             { title: 'Submit a Query',     sub: 'Raise questions or issues' },
    '/expense':           { title: 'Expense Request',    sub: 'Submit and track your expenses' },
    '/approvals/manager': { title: 'Manager Approval',   sub: 'Review pending expense requests' },
    '/approvals/finance': { title: 'Finance Approval',   sub: 'Process finance-stage approvals' },
    '/approvals/ceo':     { title: 'CEO Approval',       sub: 'Final approval decisions' },
  };

  constructor(private router: Router, private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const match = this.pageMap[e.urlAfterRedirects];
      if (match) { this.pageTitle = match.title; this.pageSubtitle = match.sub; }
    });
    // Set initial
    const cur = this.pageMap[this.router.url];
    if (cur) { this.pageTitle = cur.title; this.pageSubtitle = cur.sub; }
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.api.getNotifications().subscribe(res => {
      if (res.success) {
        this.notifications = res.data;
        this.unreadCount = res.data.filter((n: any) => !n.read).length;
      }
    });
  }

  toggleNotifs(): void {
    this.showNotifs = !this.showNotifs;
    if (this.showNotifs) this.loadNotifications();
  }

  markAll(): void {
    this.api.markAllRead().subscribe(() => {
      this.notifications.forEach(n => n.read = true);
      this.unreadCount = 0;
    });
  }

  markOne(n: any): void {
    if (!n.read) {
      this.api.markRead(n._id).subscribe();
      n.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
  }
}
