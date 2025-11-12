import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardContent, IonIcon, IonButton,
  IonRange, IonChip, IonText
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  flashOutline, flashOffOutline, pulseOutline, warningOutline
} from 'ionicons/icons';
import { FlashService } from '../utils/flash.service';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-flashlight',
  standalone: true,
  templateUrl: './flashlight.page.html',
  styleUrls: ['./flashlight.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonCard, IonCardContent, IonIcon, IonButton,
    IonRange, IonChip, IonText
  ]
})
export class FlashlightPage implements OnInit, OnDestroy {
  available = false;
  isOn = false;

  // Pisca (strobe)
  strobeOn = false;
  strobeSpeed = 350; // ms (menor = mais rápido)
  private strobeTimer?: ReturnType<typeof setInterval>;

  constructor(private flash: FlashService) {
    addIcons({ flashOutline, flashOffOutline, pulseOutline, warningOutline });
  }

  async ngOnInit() {
    // Disponibilidade (em browser geralmente é false)
    const can = await this.flash.getIsAvailable();
    this.available = !!can;
    this.isOn = this.flash.getIsOn();
  }

  ngOnDestroy() {
    this.stopStrobe();
    // segurança: apaga a lanterna quando sair
    if (this.isOn) this.flash.turnOff();
  }

  private async haptic() {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
  }

  async toggle() {
    if (!this.available) return;
    await this.haptic();
    const ok = await this.flash.toggle();
    if (ok) this.isOn = this.flash.getIsOn();
    if (!this.isOn) this.stopStrobe(); // se desligar, cancela pisca
  }

  async turnOff() {
    if (!this.available) return;
    await this.haptic();
    const ok = await this.flash.turnOff();
    if (ok) {
      this.isOn = false;
      this.stopStrobe();
    }
  }

  // -------- Pisca (strobe) ----------
  startStrobe() {
    if (!this.available) return;
    this.strobeOn = true;
    // Garante estado inicial ON para o efeito ficar visível
    if (!this.isOn) this.flash.toggle().then(() => (this.isOn = true));

    this.runStrobeLoop();
  }

  private runStrobeLoop() {
    this.stopStrobe(); // evita timers duplicados
    this.strobeTimer = setInterval(async () => {
      // alterna rápido: ON -> OFF -> ON
      await this.flash.toggle();
      this.isOn = this.flash.getIsOn();
    }, this.strobeSpeed);
  }

  stopStrobe() {
    this.strobeOn = false;
    if (this.strobeTimer) {
      clearInterval(this.strobeTimer);
      this.strobeTimer = undefined;
    }
  }

  onSpeedChange(ev: CustomEvent) {
    this.strobeSpeed = Number(ev.detail.value || 350);
    if (this.strobeOn) this.runStrobeLoop(); // aplica velocidade nova
  }

  get runningOnDevice() {
    return Capacitor.isNativePlatform();
  }
}
