import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton
  ]
})
export class HomePage {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (user) {
      // Redirige automáticamente según rol
      if (user.rol === 'encargado') {
        this.router.navigate(['/reconocimiento']);
      } else {
        this.router.navigate(['/historial']);
      }
    }
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  goRegister() {
    this.router.navigate(['/register']);
  }
}
