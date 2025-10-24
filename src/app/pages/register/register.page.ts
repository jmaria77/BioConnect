import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSelect,
    IonSelectOption
  ]
})
export class RegisterPage {
  nombre = '';
  rol: 'encargado' | 'trabajador' = 'trabajador';
  biometria = '';
  error = '';
  success = '';

  constructor(private auth: AuthService, private router: Router) {}

  capturarBiometria() {
    this.biometria = 'patron_' + Math.floor(Math.random() * 1000000);
    alert('Biometría capturada: ' + this.biometria);
  }

  register() {
    if (!this.nombre || !this.biometria || !this.rol) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    const user: User = {
      nombre: this.nombre,
      correo: this.nombre + '@bioconnect', // placeholder
      contraseña: this.biometria,         // usar biometría como "contraseña"
      rol: this.rol
    };

    const ok = this.auth.register(user);
    if (ok) {
      const biometriaData = JSON.parse(localStorage.getItem('biometria') || '{}');
      biometriaData[this.nombre] = this.biometria;
      localStorage.setItem('biometria', JSON.stringify(biometriaData));

      this.success = 'Usuario registrado correctamente';
      setTimeout(() => this.router.navigate(['/login']), 1000);
    } else {
      this.error = 'El usuario ya existe';
    }
  }
}
