export class FlashWeb {
  private isOn = false;

  async isAvailable(): Promise<{ available: boolean }> {
    return { available: false };
  }

  async switchOn(): Promise<void> {
    this.isOn = true;
    console.log('Flash ligado (simulação web)');
  }

  async switchOff(): Promise<void> {
    this.isOn = false;
    console.log('Flash desligado (simulação web)');
  }

  async toggle(): Promise<{ isOn: boolean }> {
    this.isOn = !this.isOn;
    console.log(`Flash ${this.isOn ? 'ligado' : 'desligado'} (simulação web)`);
    return { isOn: this.isOn };
  }
}