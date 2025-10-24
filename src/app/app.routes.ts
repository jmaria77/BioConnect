import { Routes } from '@angular/router';

import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from './services/auth';
import {
  IonApp,
  IonRouterOutlet,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSplitPane,
  IonMenu,
  IonList,
  IonItem,
  IonLabel,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    IonApp,
    IonRouterOutlet,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSplitPane,
    IonMenu,
    IonList,
    IonItem,
    IonLabel,
    IonButton
  ]
})
export class AppComponent {
  currentUser: User | null = null;

  constructor(private auth: AuthService, private router: Router) {
    this.currentUser = this.auth.getCurrentUser();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']); // vuelve a pantalla principal
  }
}

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },
  { path: 'reconocimiento', loadComponent: () => import('./pages/reconocimiento/reconocimiento.page').then(m => m.ReconocimientoPage) },
  { path: 'historial', loadComponent: () => import('./pages/historial/historial.page').then(m => m.HistorialPage) },
  { path: 'sincronizacion', loadComponent: () => import('./pages/sincronizacion/sincronizacion.page').then(m => m.SincronizacionPage) },
  { path: 'configuracion', loadComponent: () => import('./pages/configuracion/configuracion.page').then(m => m.ConfiguracionPage) },
];
