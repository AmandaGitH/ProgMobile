import { Routes } from '@angular/router';

export const routes: Routes = [
  // NOVO: home/perfil
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then(m => m.PerfilPage),
  },
  // NOVO: lanterna
  {
    path: 'flashlight',
    loadComponent: () => import('./flashlight/flashlight.page').then(m => m.FlashlightPage),
  },

  // já existia: galeria (está sob "home")
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.GalleryPage),
  },

  // já existia: localização
  {
    path: 'location',
    loadComponent: () => import('./location/location.page').then(m => m.LocationPage),
  },

  // redireciona para a nova home
  { path: '', redirectTo: 'perfil', pathMatch: 'full' },
];
