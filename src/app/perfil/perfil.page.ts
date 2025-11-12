import { Component, AfterViewInit, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardHeader, IonCardContent, IonAvatar,
  IonGrid, IonRow, IonCol, IonIcon, IonFab, IonFabButton, IonButton,
  IonRefresher, IonRefresherContent, IonItem, IonCheckbox, IonLabel
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  flashOutline, logoGithub, logoLinkedin, logoInstagram,
  mailOutline, schoolOutline, addCircleOutline
} from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Preferences } from '@capacitor/preferences';
import { AlertController, ToastController } from '@ionic/angular';

type StepItem = { key: string; label: string; done: boolean };
const STEPS_KEY = 'perfil:steps';

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonCard, IonCardHeader, IonCardContent, IonAvatar,
    IonGrid, IonRow, IonCol, IonIcon, IonFab, IonFabButton, IonButton,
    IonRefresher, IonRefresherContent, IonItem, IonCheckbox, IonLabel
  ]
})
export class PerfilPage implements OnInit, AfterViewInit {
  saudacao = '';

  // contadores (alvos)
  targetProjects = 8;
  targetDisciplines = 31;
  targetHours = 1240;

  // contadores (exibidos)
  projects = 0;
  disciplines = 0;
  hours = 0;

  // lembretes (persistentes)
  steps: StepItem[] = [
    { key: 'step1', label: 'Finalizar relatório da disciplina', done: false },
    { key: 'step2', label: 'Publicar novo projeto no GitHub',  done: false },
    { key: 'step3', label: 'Atualizar currículo no LinkedIn',  done: false }
  ];

  constructor(
    private alert: AlertController,
    private toast: ToastController
  ) {
    addIcons({
      flashOutline, logoGithub, logoLinkedin, logoInstagram,
      mailOutline, schoolOutline, addCircleOutline
    });
    const h = new Date().getHours();
    this.saudacao = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  }

  async ngOnInit() {
    await this.loadSteps();
  }

  ngAfterViewInit() {
    this.animateCount('projects', this.targetProjects, 900);
    this.animateCount('disciplines', this.targetDisciplines, 900);
    this.animateCount('hours', this.targetHours, 1200);
  }

  /** animação suave dos contadores */
  private animateCount(
    prop: 'projects' | 'disciplines' | 'hours',
    target: number,
    duration = 800
  ) {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      (this as any)[prop] = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /** abrir link (Browser nativo no device, nova aba no web) */
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

  /** pull-to-refresh: recarrega lembretes e reanima contadores */
  async reload(ev: any) {
    await this.loadSteps();
    this.ngAfterViewInit();
    setTimeout(() => ev.target.complete(), 600);
  }

  /** compartilhar perfil */
  async share() {
    try {
      if (Capacitor.isPluginAvailable('Share')) {
        await Share.share({
          title: 'Meu perfil',
          text: 'Confira meu perfil e projetos 💜',
          url: 'https://www.linkedin.com/in/amanda-nascimento-4b4541336'
        });
      } else if ((navigator as any).share) {
        await (navigator as any).share({
          title: 'Meu perfil',
          text: 'Confira meu perfil e projetos 💜',
          url: 'https://www.linkedin.com/in/amanda-nascimento-4b4541336'
        });
      } else {
        window.open('https://www.linkedin.com/in/amanda-nascimento-4b4541336', '_blank');
      }
    } catch {}
  }

  /** persistência - salva lista completa */
  async saveSteps() {
    await Preferences.set({ key: STEPS_KEY, value: JSON.stringify(this.steps) });
  }

  /** persistência - carrega lista (com fallback do modelo antigo) */
  private async loadSteps() {
    const r = await Preferences.get({ key: STEPS_KEY });
    if (r.value) {
      try {
        this.steps = JSON.parse(r.value);
        return;
      } catch {
        // continua para fallback
      }
    }
    // Fallback: quem já tinha o formato antigo (por chave)
    const legacyLoaded = await Promise.all(
      this.steps.map(async s => {
        const v = await Preferences.get({ key: `perfil:${s.key}` });
        return { ...s, done: v.value === 'true' };
      })
    );
    this.steps = legacyLoaded;
    await this.saveSteps(); // migra para o formato novo
  }

  /** adicionar nova tarefa via Alert */
  async addTask() {
    const alert = await this.alert.create({
      header: 'Novo lembrete',
      inputs: [
        { type: 'text', name: 'label', placeholder: 'Descreva a tarefa...' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: async (data) => {
            const label = (data?.label || '').trim();
            if (!label) return false;
            const key = 'step' + Date.now();
            this.steps = [...this.steps, { key, label, done: false }];
            await this.saveSteps();
            (await this.toast.create({ message: 'Lembrete adicionado', duration: 1200, color: 'success'})).present();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }
}
