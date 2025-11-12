import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, 
  IonContent, IonButton, IonIcon, IonCard, IonCardContent, 
  IonSpinner, IonItem, IonLabel, IonList, IonBadge,
  IonGrid, IonRow, IonCol, IonToast, IonChip
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  navigate, location, car, compass, statsChart, 
  time, map, shareSocial, stopCircle, playCircle, add,
  remove, warning, checkmarkCircle, pulse, navigateOutline,
  locate, mapOutline, pin, speedometer, cellular
} from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

declare let L: any;

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonButton, IonIcon, IonCard, IonCardContent,
    IonSpinner, IonItem, IonLabel, IonList, IonBadge,
    IonGrid, IonRow, IonCol, IonToast, IonChip
  ]
})
export class LocationPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  currentLocation: LocationData | null = null;
  currentAddress: string = '';
  isLoading: boolean = false;
  isTracking: boolean = false;
  locationError: string = '';
  watchId: string = '';
  
  // UI States
  isSheetExpanded: boolean = false;
  isSatelliteView: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  
  // Mapa
  private map: any;
  private userMarker: any;
  private accuracyCircle: any;
  
  // Otimização
  private lastUpdateTime: number = 0;
  private readonly UPDATE_INTERVAL = 2000; // 2 segundos
  
  // Estatísticas
  locationCount: number = 0;
  averageAccuracy: number = 0;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    addIcons({ 
      navigate, location, car, compass, statsChart, 
      time, map, shareSocial, stopCircle, playCircle, add,
      remove, warning, checkmarkCircle, pulse, navigateOutline,
      locate, mapOutline, pin, speedometer, cellular
    });
  }

  async ngOnInit() {
    await this.checkPermissions();
  }

  ngAfterViewInit() {
    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(() => {
      this.initMap();
    }, 300);
  }

  ngOnDestroy() {
    this.stopTracking();
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    try {
      console.log('Inicializando mapa...');
      
      // Verifica se o elemento do mapa existe
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Elemento do mapa não encontrado!');
        return;
      }

      // Inicializa o mapa
      this.map = L.map('map', {
        zoomControl: true,
        attributionControl: true
      }).setView([-23.5505, -46.6333], 13);

      // Adiciona camada do mapa
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      console.log('Mapa inicializado com sucesso');

      // Força redimensionamento após um breve delay
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log('Mapa redimensionado');
        }
      }, 500);

    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
    }
  }

  private createCarIcon(): any {
    return L.divIcon({
      className: 'car-marker-container',
      html: '<div class="car-marker"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30], // Ancora na parte inferior
      popupAnchor: [0, -30]
    });
  }

  private updateMap(latitude: number, longitude: number, accuracy: number, heading: number | null = null) {
    if (!this.map) {
      console.log('Mapa não inicializado, tentando novamente...');
      setTimeout(() => {
        this.initMap();
        this.updateMap(latitude, longitude, accuracy, heading);
      }, 500);
      return;
    }

    try {
      const now = Date.now();
      
      // Filtro para evitar updates muito frequentes
      if (now - this.lastUpdateTime < 1000 && this.userMarker) {
        return;
      }

      this.lastUpdateTime = now;

      const newPosition: [number, number] = [latitude, longitude];

      console.log('Atualizando mapa para:', newPosition);

      // Remove marcador anterior se existir
      if (this.userMarker) {
        this.map.removeLayer(this.userMarker);
      }

      // Remove círculo de precisão anterior
      if (this.accuracyCircle) {
        this.map.removeLayer(this.accuracyCircle);
      }

      // Cria ícone do carro
      const carIcon = this.createCarIcon();

      // Adiciona novo marcador
      this.userMarker = L.marker(newPosition, { 
        icon: carIcon,
        title: 'Sua localização'
      }).addTo(this.map);

      // Adiciona popup
      this.userMarker.bindPopup(`
        <div style="text-align: center;">
          <strong>Sua Localização</strong><br>
          Lat: ${latitude.toFixed(6)}<br>
          Lng: ${longitude.toFixed(6)}<br>
          Precisão: ${accuracy.toFixed(1)}m
        </div>
      `);

      // Adiciona círculo de precisão
      this.accuracyCircle = L.circle(newPosition, {
        color: '#4285F4',
        fillColor: '#4285F4',
        fillOpacity: 0.1,
        weight: 2,
        radius: accuracy
      }).addTo(this.map);

      // Centraliza o mapa na primeira localização
      if (this.locationCount <= 1) {
        this.map.setView(newPosition, 16, {
          animate: true,
          duration: 1
        });
      } else {
        // Para localizações subsequentes, faz pan suave
        this.map.panTo(newPosition, {
          animate: true,
          duration: 1
        });
      }

      // Atualiza endereço
      this.reverseGeocode(latitude, longitude);

      // Força redimensionamento se necessário
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);

    } catch (error) {
      console.error('Erro ao atualizar mapa:', error);
    }
  }

  private async reverseGeocode(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Erro na requisição de geocoding');
      }
      
      const data = await response.json();
      
      if (data.display_name) {
        this.currentAddress = data.display_name.split(',').slice(0, 3).join(',');
        this.changeDetectorRef.detectChanges();
      }
    } catch (error) {
      console.error('Erro no reverse geocoding:', error);
      // Não define currentAddress em caso de erro
    }
  }

  async getCurrentLocation() {
    try {
      this.isLoading = true;
      this.locationError = '';
      this.changeDetectorRef.detectChanges();

      console.log('Obtendo localização...');

      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000
      });

      console.log('Localização obtida:', coordinates);

      this.updateLocationData(coordinates);
      this.showToastMessage('Localização encontrada!');
      
    } catch (error: any) {
      console.error('Erro ao obter localização:', error);
      this.locationError = this.getErrorMessage(error);
      this.showToastMessage('Erro ao obter localização');
    } finally {
      this.isLoading = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  async startTracking() {
    try {
      this.locationError = '';
      
      console.log('Iniciando rastreamento...');

      this.watchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }, (position, err) => {
        if (err) {
          console.error('Erro no watchPosition:', err);
          this.locationError = this.getErrorMessage(err);
          this.isTracking = false;
          this.changeDetectorRef.detectChanges();
          return;
        }

        if (position) {
          console.log('Nova posição no rastreamento:', position);
          this.updateLocationData(position);
          this.isTracking = true;
          this.changeDetectorRef.detectChanges();
        }
      });

      this.showToastMessage('Rastreamento iniciado');

    } catch (error: any) {
      console.error('Erro ao iniciar rastreamento:', error);
      this.locationError = this.getErrorMessage(error);
      this.showToastMessage('Erro ao iniciar rastreamento');
    }
  }

  stopTracking() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = '';
      this.isTracking = false;
      this.showToastMessage('Rastreamento parado');
      this.changeDetectorRef.detectChanges();
    }
  }

  private updateLocationData(position: any) {
    this.currentLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      speed: position.coords.speed,
      heading: position.coords.heading,
      timestamp: position.timestamp
    };

    console.log('Atualizando dados de localização:', this.currentLocation);

    this.updateMap(
      position.coords.latitude,
      position.coords.longitude,
      position.coords.accuracy,
      position.coords.heading
    );

    this.locationCount++;
    
    // Atualiza precisão média
    if (this.averageAccuracy === 0) {
      this.averageAccuracy = position.coords.accuracy;
    } else {
      this.averageAccuracy = (this.averageAccuracy + position.coords.accuracy) / 2;
    }

    this.changeDetectorRef.detectChanges();
  }

  centerToUserLocation() {
    if (this.currentLocation && this.map) {
      this.map.setView(
        [this.currentLocation.latitude, this.currentLocation.longitude],
        16,
        { animate: true, duration: 1 }
      );
      this.showToastMessage('Mapa centralizado');
    } else {
      this.showToastMessage('Nenhuma localização disponível');
    }
  }

  zoomIn() {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut() {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  toggleMapStyle() {
    this.isSatelliteView = !this.isSatelliteView;
    
    if (this.map) {
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          this.map.removeLayer(layer);
        }
      });

      if (this.isSatelliteView) {
        L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(this.map);
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(this.map);
      }
    }
  }

  toggleSheet() {
    this.isSheetExpanded = !this.isSheetExpanded;
  }

  async shareLocation() {
    if (this.currentLocation) {
      const coords = `${this.currentLocation.latitude},${this.currentLocation.longitude}`;
      const url = `https://maps.google.com/?q=${coords}`;
      const text = `Minha localização atual: ${url}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Minha Localização',
          text: text
        });
      } else {
        await navigator.clipboard.writeText(text);
        this.showToastMessage('Localização copiada!');
      }
    }
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    Haptics.impact({ style: ImpactStyle.Light });
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 1: return 'Permissão de localização negada';
      case 2: return 'Localização indisponível';
      case 3: return 'Tempo limite excedido';
      default: return 'Erro desconhecido na localização';
    }
  }

  async checkPermissions() {
    try {
      const permission = await Geolocation.checkPermissions();
      console.log('Permissões:', permission);
      
      if (permission.location !== 'granted') {
        this.locationError = 'Permissão de localização necessária';
      } else {
        this.locationError = '';
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      this.locationError = 'Erro ao verificar permissões';
    }
  }

  async requestPermissions() {
    try {
      const permission = await Geolocation.requestPermissions();
      
      if (permission.location === 'granted') {
        this.locationError = '';
        this.showToastMessage('Permissão concedida!');
      } else {
        this.locationError = 'Permissão de localização negada';
        this.showToastMessage('Permissão negada');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      this.locationError = 'Erro ao solicitar permissões';
    }
  }

  formatCoordinate(coord: number): string {
    return coord.toFixed(6);
  }

  formatAccuracy(accuracy: number): string {
    return `${accuracy.toFixed(1)}m`;
  }

  formatSpeed(speed: number | null): string {
    if (!speed) return '0 km/h';
    return `${(speed * 3.6).toFixed(1)} km/h`;
  }

  formatHeading(heading: number | null): string {
    if (!heading) return 'N/A';
    const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(heading / 45) % 8;
    return `${directions[index]} (${Math.round(heading)}°)`;
  }

  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  }

  openInMaps() {
    if (this.currentLocation) {
      const url = `https://maps.google.com/?q=${this.currentLocation.latitude},${this.currentLocation.longitude}`;
      window.open(url, '_blank');
    }
  }
}