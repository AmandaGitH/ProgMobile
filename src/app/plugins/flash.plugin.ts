import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

const FlashPlugin = registerPlugin<any>('FlashPlugin', {
  web: () => import('./flash.web').then(m => new m.FlashWeb()),
});

export interface FlashPlugin {
  isAvailable(): Promise<{ available: boolean }>;
  switchOn(): Promise<void>;
  switchOff(): Promise<void>;
  toggle(): Promise<{ isOn: boolean }>;
}

export const Flash = FlashPlugin;