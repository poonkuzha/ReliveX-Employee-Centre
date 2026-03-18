import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Layout
import { SidebarComponent }  from './components/sidebar/sidebar.component';
import { TopbarComponent }   from './components/topbar/topbar.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';

// Auth Pages
import { LoginComponent }    from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotComponent }   from './pages/auth/forgot/forgot.component';

// Dashboard
import { DashboardComponent } from './pages/dashboard/dashboard.component';

// Profile
import { ProfileComponent } from './pages/profile/profile.component';

// Career
import { CareerComponent } from './pages/career/career.component';

// Query
import { QueryComponent } from './pages/query/query.component';

// Expense
import { ExpenseComponent } from './pages/expense/expense.component';

// Approvals
import { ManagerApprovalComponent } from './pages/approvals/manager/manager-approval.component';
import { FinanceApprovalComponent }  from './pages/approvals/finance/finance-approval.component';
import { CeoApprovalComponent }      from './pages/approvals/ceo/ceo-approval.component';

// Result
import { ApprovalResultComponent } from './pages/approvals/result/approval-result.component';

// Interceptors & Guards
import { AuthInterceptor }  from './services/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    TopbarComponent,
    AppLayoutComponent,
    LoginComponent,
    RegisterComponent,
    ForgotComponent,
    DashboardComponent,
    ProfileComponent,
    CareerComponent,
    QueryComponent,
    ExpenseComponent,
    ManagerApprovalComponent,
    FinanceApprovalComponent,
    CeoApprovalComponent,
    ApprovalResultComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
