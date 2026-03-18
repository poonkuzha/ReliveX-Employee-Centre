import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }    from './guards/auth.guard';
import { RoleGuard }    from './guards/role.guard';
import { GuestGuard }   from './guards/guest.guard';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';

import { LoginComponent }    from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotComponent }   from './pages/auth/forgot/forgot.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent }   from './pages/profile/profile.component';
import { CareerComponent }    from './pages/career/career.component';
import { QueryComponent }     from './pages/query/query.component';
import { ExpenseComponent }   from './pages/expense/expense.component';
import { ManagerApprovalComponent } from './pages/approvals/manager/manager-approval.component';
import { FinanceApprovalComponent }  from './pages/approvals/finance/finance-approval.component';
import { CeoApprovalComponent }      from './pages/approvals/ceo/ceo-approval.component';
import { ApprovalResultComponent }   from './pages/approvals/result/approval-result.component';

const routes: Routes = [
  // Auth (no sidebar)
  { path: 'login',    component: LoginComponent,    canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'forgot',   component: ForgotComponent,   canActivate: [GuestGuard] },

  // Protected — with sidebar layout
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile',   component: ProfileComponent },
      { path: 'career',    component: CareerComponent },
      { path: 'query',     component: QueryComponent },
      { path: 'expense',   component: ExpenseComponent },
      { path: 'expense/:id/result', component: ApprovalResultComponent },

      // Manager approval
      {
        path: 'approvals/manager',
        component: ManagerApprovalComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Manager'] }
      },
      // Finance approval
      {
        path: 'approvals/finance',
        component: FinanceApprovalComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Finance'] }
      },
      // CEO approval
      {
        path: 'approvals/ceo',
        component: CeoApprovalComponent,
        canActivate: [RoleGuard],
        data: { roles: ['CEO'] }
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
