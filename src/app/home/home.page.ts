import { Component, OnInit, OnDestroy } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, 
  IonContent, IonButton, IonIcon, IonGrid, IonRow, IonCol, 
  IonCard, IonCardHeader, IonCardContent, IonAlert,
  IonSpinner, IonText, IonActionSheet, IonToggle,
  IonLabel
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { cameraOutline, imagesOutline, trashOutline, shareOutline, flashOutline, flashOffOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface GalleryImage {
  id: string;
  webViewPath: string;
  date: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardContent, IonAlert,
    IonSpinner, IonText, IonActionSheet, IonToggle,
    IonLabel
  ]
})
export class GalleryPage implements OnInit, OnDestroy {
  images: GalleryImage[] = [];
  isLoading: boolean = false;
  isTakingPhoto: boolean = false;
  isFlashAvailable: boolean = false;
  isFlashOn: boolean = false;
  flashError: string = '';
  flashMode: string = 'verificando...';
  
  // Alert properties
  isAlertOpen = false;
  alertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
    },
    {
      text: 'Excluir',
      role: 'destructive',
      handler: () => this.deleteImage(this.imageToDelete!)
    }
  ];
  imageToDelete: GalleryImage | null = null;

  // Action Sheet
  isActionSheetOpen = false;
  selectedImage: GalleryImage | null = null;
  actionSheetButtons = [
    {
      text: 'Compartilhar',
      icon: 'share-outline',
      data: {
        action: 'share',
      },
    },
    {
      text: 'Excluir',
      icon: 'trash-outline',
      role: 'destructive',
      data: {
        action: 'delete',
      },
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  constructor() {
    addIcons({ 
      cameraOutline, imagesOutline, trashOutline, shareOutline, 
      flashOutline, flashOffOutline 
    });
  }

  async ngOnInit() {
    await this.checkFlashAvailability();
    await this.loadGallery();
  }

  ngOnDestroy() {
    this.turnOffFlash();
  }

  async checkFlashAvailability() {
    try {
      // Método 1: Verifica se está em um dispositivo móvel
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (!isMobile) {
        this.flashMode = 'Apenas em dispositivos móveis';
        this.flashError = 'Teste em um dispositivo Android real';
        return;
      }

      // Método 2: Tenta detectar se há suporte a lanterna
      // No navegador não temos acesso direto, então assumimos que pode funcionar no Android
      this.isFlashAvailable = true;
      this.flashMode = 'Pronto para uso';
      this.flashError = '';
      
      console.log('Dispositivo móvel detectado, lanterna presumida disponível');

    } catch (error) {
      console.error('Erro ao verificar lanterna:', error);
      this.isFlashAvailable = false;
      this.flashMode = 'erro na verificação';
      this.flashError = 'Erro ao verificar disponibilidade';
    }
  }

  async toggleFlash() {
    try {
      if (!this.isFlashAvailable) {
        this.flashError = 'Lanterna não disponível neste ambiente';
        return;
      }

      if (this.isFlashOn) {
        await this.turnOffFlash();
      } else {
        await this.turnOnFlash();
      }
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error('Erro ao controlar lanterna:', error);
      this.flashError = 'Erro: ' + error;
    }
  }

  async turnOnFlash() {
    try {
      // Método 1: Tenta usar o plugin Cordova se disponível
      if (typeof window !== 'undefined' && (window as any).plugins && (window as any).plugins.flashlight) {
        (window as any).plugins.flashlight.switchOn();
        console.log('Lanterna ligada via Cordova plugin');
      }
      // Método 2: Tenta usar interface nativa do Android
      else if (typeof window !== 'undefined' && (window as any).Android && (window as any).Android.toggleFlashlight) {
        (window as any).Android.toggleFlashlight(true);
        console.log('Lanterna ligada via interface Android');
      }
      // Método 3: Fallback - simulação com feedback
      else {
        console.log('Lanterna ligada (simulação - funcionalidade real requer app nativo)');
        // Em produção, aqui você implementaria uma solução nativa
      }

      this.isFlashOn = true;
      this.flashError = '';
      this.flashMode = 'Lanterna Ligada';
      
      await Haptics.impact({ style: ImpactStyle.Medium });
      
    } catch (error) {
      console.error('Erro ao ligar lanterna:', error);
      this.isFlashOn = false;
      this.flashError = 'Não foi possível ligar a lanterna';
      this.flashMode = 'Erro';
    }
  }

  async turnOffFlash() {
    try {
      // Método 1: Tenta usar o plugin Cordova se disponível
      if (typeof window !== 'undefined' && (window as any).plugins && (window as any).plugins.flashlight) {
        (window as any).plugins.flashlight.switchOff();
        console.log('Lanterna desligada via Cordova plugin');
      }
      // Método 2: Tenta usar interface nativa do Android
      else if (typeof window !== 'undefined' && (window as any).Android && (window as any).Android.toggleFlashlight) {
        (window as any).Android.toggleFlashlight(false);
        console.log('Lanterna desligada via interface Android');
      }
      // Método 3: Fallback - simulação
      else {
        console.log('Lanterna desligada (simulação)');
      }

      this.isFlashOn = false;
      this.flashError = '';
      this.flashMode = 'Lanterna Desligada';
      
    } catch (error) {
      console.error('Erro ao desligar lanterna:', error);
      this.flashError = 'Erro ao desligar lanterna';
    }
  }

  // ... (o resto dos métodos permanecem iguais: loadGallery, saveGallery, takePhoto, etc.)

  async loadGallery() {
    try {
      this.isLoading = true;
      const { value } = await Preferences.get({ key: 'gallery_images' });
      
      if (value) {
        this.images = JSON.parse(value);
      } else {
        this.images = [];
      }
    } catch (error) {
      console.error('Erro ao carregar galeria:', error);
      this.images = [];
    } finally {
      this.isLoading = false;
    }
  }

  async saveGallery() {
    try {
      await Preferences.set({
        key: 'gallery_images',
        value: JSON.stringify(this.images)
      });
    } catch (error) {
      console.error('Erro ao salvar galeria:', error);
    }
  }

  async takePhoto() {
    try {
      this.isTakingPhoto = true;
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: true
      });

      if (image.webPath) {
        const newImage: GalleryImage = {
          id: Date.now().toString(),
          webViewPath: image.webPath,
          date: new Date().toISOString()
        };

        this.images.unshift(newImage);
        await this.saveGallery();
        
        await Haptics.impact({ style: ImpactStyle.Heavy });
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      await Haptics.impact({ style: ImpactStyle.Medium });
    } finally {
      this.isTakingPhoto = false;
    }
  }

  async takePhotoWithFlash() {
    try {
      const wasFlashOn = this.isFlashOn;
      
      await this.takePhoto();
      
      if (wasFlashOn) {
        setTimeout(() => {
          this.turnOffFlash();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Erro ao tirar foto com flash:', error);
    }
  }

  async takePhotoFromGallery() {
    try {
      this.isTakingPhoto = true;
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      if (image.webPath) {
        const newImage: GalleryImage = {
          id: Date.now().toString(),
          webViewPath: image.webPath,
          date: new Date().toISOString()
        };

        this.images.unshift(newImage);
        await this.saveGallery();
      }
    } catch (error) {
      console.error('Erro ao selecionar da galeria:', error);
    } finally {
      this.isTakingPhoto = false;
    }
  }

  openImage(image: GalleryImage) {
    this.selectedImage = image;
    this.setActionSheetOpen(true);
  }

  confirmDelete(image: GalleryImage) {
    this.imageToDelete = image;
    this.isAlertOpen = true;
  }

  async deleteImage(image: GalleryImage) {
    this.images = this.images.filter(img => img.id !== image.id);
    await this.saveGallery();
    this.imageToDelete = null;
    await Haptics.impact({ style: ImpactStyle.Light });
  }

  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
    if (!isOpen) {
      this.imageToDelete = null;
    }
  }

  setActionSheetOpen(isOpen: boolean) {
    this.isActionSheetOpen = isOpen;
    if (!isOpen) {
      this.selectedImage = null;
    }
  }

  onActionSheetResult(event: any) {
    if (event.detail.data?.action === 'delete' && this.selectedImage) {
      this.confirmDelete(this.selectedImage);
    } else if (event.detail.data?.action === 'share' && this.selectedImage) {
      this.shareImage(this.selectedImage);
    }
  }

  async shareImage(image: GalleryImage) {
    console.log('Compartilhar imagem:', image);
    await Haptics.impact({ style: ImpactStyle.Light });
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}