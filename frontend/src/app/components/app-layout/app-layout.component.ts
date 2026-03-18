// app-layout.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-topbar></app-topbar>
        <div class="content-area fade-in">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AppLayoutComponent {}
