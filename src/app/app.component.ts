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
    IonLabel,  // <- importante para NG8001
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
    this.router.navigate(['/home']); // vuelve a la pantalla principal
  }
}
