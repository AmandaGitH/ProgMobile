import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class FlashService {
  private isAvailable: boolean = false;
  private isOn: boolean = false;

  constructor() {
    this.checkAvailability();
  }

  async checkAvailability(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      // No Android, podemos tentar acessar a lanterna
      this.isAvailable = true;
    } else {
      // No navegador, verificamos se a API de mídia está disponível
      this.isAvailable = !!(navigator.mediaDevices && 
                           navigator.mediaDevices.getUserMedia);
    }
    return this.isAvailable;
  }

  async toggle(): Promise<boolean> {
    if (this.isOn) {
      return await this.turnOff();
    } else {
      return await this.turnOn();
    }
  }

  async turnOn(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Solução para Android usando Intent (aproximação)
        // Em uma implementação real, você criaria um plugin nativo
        this.isOn = true;
        await Haptics.impact({ style: ImpactStyle.Medium });
        console.log('Lanterna ligada (simulação)');
        return true;
      } else {
        // No navegador - simulação
        this.isOn = true;
        console.log('Lanterna ligada (simulação no navegador)');
        return true;
      }
    } catch (error) {
      console.error('Erro ao ligar lanterna:', error);
      this.isOn = false;
      return false;
    }
  }

  async turnOff(): Promise<boolean> {
    try {
      this.isOn = false;
      await Haptics.impact({ style: ImpactStyle.Light });
      console.log('Lanterna desligada');
      return true;
    } catch (error) {
      console.error('Erro ao desligar lanterna:', error);
      return false;
    }
  }

  getIsAvailable(): boolean {
    return this.isAvailable;
  }

  getIsOn(): boolean {
    return this.isOn;
  }
}