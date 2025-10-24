import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-reconocimiento',
  templateUrl: './reconocimiento.page.html',
  styleUrls: ['./reconocimiento.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent
  ],
})
export class ReconocimientoPage {}
