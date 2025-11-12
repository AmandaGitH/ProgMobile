import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonText, IonToggle, IonLabel
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { flashOutline, flashOffOutline } from 'ionicons/icons';
import { FlashService } from '../utils/flash.service';

@Component({
  selector: 'app-flashlight',
  standalone: true,
  templateUrl: './flashlight.page.html',
  styleUrls: ['./flashlight.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonText, IonToggle, IonLabel
  ]
})
export class FlashlightPage {
  available = false;
  isOn = false;

  constructor(private flash: FlashService) {
    addIcons({ flashOutline, flashOffOutline });
    this.available = this.flash.getIsAvailable();
    this.isOn = this.flash.getIsOn();
  }

  async toggle() {
    const ok = await this.flash.toggle();
    if (ok) this.isOn = this.flash.getIsOn();
  }

  async turnOff() {
    const ok = await this.flash.turnOff();
    if (ok) this.isOn = false;
  }
}
