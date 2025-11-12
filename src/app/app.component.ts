// app.component.ts
import { Component } from '@angular/core';
import { 
  IonApp, 
  IonRouterOutlet, 
  IonSplitPane, 
  IonMenu, 
  IonContent, 
  IonList, 
  IonListHeader, 
  IonNote, 
  IonMenuToggle, 
  IonItem, 
  IonIcon, 
  IonLabel,
  IonAvatar
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface AppPage {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonApp, 
    IonRouterOutlet, 
    IonSplitPane, 
    IonMenu, 
    IonContent, 
    IonList, 
    IonListHeader, 
    IonNote, 
    IonMenuToggle, 
    IonItem, 
    IonIcon, 
    IonLabel,
    IonAvatar,
    RouterModule,
    CommonModule // Importante para o @for funcionar
  ],
})
export class AppComponent {
  public appPages: AppPage[] = [
    {
      title: 'Home',
      url: '/perfil',
      icon: 'home'
    },
    {
      title: 'Lanterna',
      url: '/flashlight',
      icon: 'flash'
    },
    {
      title: 'Galeria',
      url: '/home',
      icon: 'images'
    },
    {
      title: 'Localização',
      url: '/location',
      icon: 'location'
    }
  ];

  constructor() {}
}
