import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'home',
    loadComponent: () => import('./views/home/home.page').then((m) => m.HomePage),
  },
  // {
  //   path: 'stock',
  //   loadComponent: () => import('./views/control-stock/control-stock.component').then((m) => m.ControlStockComponent),
  // },
  {
    path: 'login',
    loadComponent: () => import('./views/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'orderAdmin',
    loadComponent: () => import('./views/order-admin/order-admin.component').then((m) => m.OrderAdminComponent),
  },
  {
    path: 'cupon',
    loadComponent: () => import('./views/cupon/cupon.component').then((m) => m.CuponComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
