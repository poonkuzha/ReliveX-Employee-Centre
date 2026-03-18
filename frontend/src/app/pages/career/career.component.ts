import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-career',
  template: `
    <div class="slide-up">
      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div *ngIf="recommended.length" style="margin-bottom:28px">
        <h3 style="margin-bottom:16px">⭐ Recommended for You</h3>
        <div class="grid-3">
          <div *ngFor="let job of recommended" class="job-card recommended">
            <div class="job-dept">{{ job.department }}</div>
            <h3 style="margin:8px 0">{{ job.title }}</h3>
            <div class="job-meta">
              <span>📍 {{ job.location }}</span>
              <span>🕒 {{ job.type }}</span>
            </div>
            <p style="font-size:0.83rem;margin:10px 0">{{ job.description }}</p>
            <div class="skills-wrap">
              <span *ngFor="let s of job.skills?.slice(0,3)" class="skill-tag">{{ s }}</span>
            </div>
            <button class="btn btn-primary btn-full" style="margin-top:14px" (click)="applyJob(job)">Apply Now</button>
          </div>
        </div>
      </div>

      <h3 style="margin-bottom:16px">All Open Positions</h3>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div *ngFor="let job of jobs" class="job-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
            <div>
              <div class="job-dept">{{ job.department }}</div>
              <h3 style="margin:6px 0">{{ job.title }}</h3>
              <div class="job-meta">
                <span>📍 {{ job.location }}</span>
                <span>🕒 {{ job.type }}</span>
                <span *ngIf="job.salaryRange?.min">
                  💰 {{ job.salaryRange.currency }} {{ job.salaryRange.min | number }} – {{ job.salaryRange.max | number }}
                </span>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" (click)="applyJob(job)">Apply</button>
          </div>
          <p style="font-size:0.85rem;margin:10px 0;color:var(--text2)">{{ job.description }}</p>
          <div class="skills-wrap">
            <span *ngFor="let s of job.skills" class="skill-tag">{{ s }}</span>
          </div>
        </div>
        <div *ngIf="!loading && jobs.length === 0" style="text-align:center;padding:48px;color:var(--text3)">
          No open positions at the moment.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .job-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 22px;
      transition: all .3s; box-shadow: var(--card-shadow);
    }
    .job-card:hover { box-shadow: var(--card-hover); transform: translateY(-2px); border-color: rgba(23,82,232,0.2); }
    .job-card.recommended { border-color: rgba(23,82,232,0.25); }
    .job-dept { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--blue-main); }
    .job-meta { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 4px; }
    .job-meta span { font-size: 0.8rem; color: var(--text2); }
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .skill-tag {
      background: var(--bg3); color: var(--blue-mid);
      border: 1px solid rgba(23,82,232,0.15);
      padding: 3px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 500;
    }
  `]
})
export class CareerComponent implements OnInit {
  jobs: any[] = [];
  recommended: any[] = [];
  loading = true;

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.api.getJobs().subscribe(res => {
      if (res.success) this.jobs = res.data;
      this.loading = false;
    });
    this.api.getRecommendedJobs().subscribe(res => {
      if (res.success) this.recommended = res.data;
    });
  }

  applyJob(job: any): void {
    const user = this.auth.currentUser;
    if (!user) { this.showToast('Please log in to apply.'); return; }
    // Only allow if user's role matches job requirements
    const allowedRoles = job.requirements || [];
    if (allowedRoles.includes(user.role)) {
      this.showToast('Based on your role, you matched and applied successfully!');
    } else {
      this.showToast('Your role does not match the requirements for this job.');
    }
  }

  showToast(msg: string): void {
    // Removed toast logic
  }
}
