import { Component, AfterViewInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardHeader, IonCardContent, IonAvatar,
  IonGrid, IonRow, IonCol, IonIcon, IonFab, IonFabButton, IonText, IonButton
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  flashOutline, logoGithub, logoLinkedin, logoInstagram,
  mailOutline, schoolOutline
} from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonCard, IonCardHeader, IonCardContent, IonAvatar,
    IonGrid, IonRow, IonCol, IonIcon, IonFab, IonFabButton, IonText, IonButton
  ]
})
export class PerfilPage implements AfterViewInit {
  saudacao = '';

  // ALVOS do contador
  targetProjects = 8;
  targetDisciplines = 31;
  targetHours = 1240;

  // Valores animados exibidos
  projects = 0;
  disciplines = 0;
  hours = 0;

  constructor() {
    addIcons({ flashOutline, logoGithub, logoLinkedin, logoInstagram, mailOutline, schoolOutline });
    const h = new Date().getHours();
    this.saudacao = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  }

  ngAfterViewInit() {
    this.animateCount('projects', this.targetProjects, 900);
    this.animateCount('disciplines', this.targetDisciplines, 900);
    this.animateCount('hours', this.targetHours, 1200);
  }

  /** animação suave sem libs */
  private animateCount(
    prop: 'projects' | 'disciplines' | 'hours',
    target: number,
    duration = 800
  ) {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      (this as any)[prop] = Math.round(target * this.easeOutCubic(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  async open(url: string) {
    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url, presentationStyle: 'fullscreen' });
      } else {
        window.open(url, '_blank');
      }
    } catch {
      window.open(url, '_blank');
    }
  }
}
