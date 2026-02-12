import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { Accueil } from './components/accueil/accueil';
import { AuthGuard } from './guard/auth-guard';
import { DashboadHotel } from './components/dashboad-hotel/dashboad-hotel';

export const routes: Routes = [
  {
    path: '',
    component: Accueil,
    pathMatch: 'full'
  },
  {
    path: 'accueil',
    component: Accueil
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'dashboard',
    component: DashboadHotel,
    // canActivate: [AuthGuard]
  },
  {
    path: 'chambres',
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/chambres/liste-chambre/liste-chambre')
          .then(m => m.ListeChambres)
      },
      {
        path: 'create',
        loadComponent: () => import('./components/chambres/form-chambre/form-chambre')
          .then(m => m.FormChambre)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/chambres/form-chambre/form-chambre')
          .then(m => m.FormChambre)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/chambres/detail-chambre/detail-chambre')
          .then(m => m.DetailChambre)
      }
    ]
  },
  { 
    path: 'reservation',
     canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/reservations/listrservation/listrservation')
          .then(m => m.Listrservation)
      },
      {
        path: 'create',
        loadComponent: () => import('./components/reservations/creatrservation/creatrservation')
          .then(m => m.Creatrservation)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/reservations/creatrservation/creatrservation')
          .then(m => m.Creatrservation)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/reservations/detail-reservation/detail-reservation')
          .then(m => m.DetailReservation)
      }
    ]
  },
  { 
    path: 'employes',
     canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/employes/listeemploye/listeemploye')
          .then(m => m.Listemploye)
      },
      {
        path: 'create',
        loadComponent: () => import('./components/employes/createemploye/createemploye')
          .then(m => m.Createemploye)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/employes/createemploye/createemploye')
          .then(m => m.Createemploye)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/employes/detailemploye/detailemploye')
          .then(m => m.Detailemploye)
      }
    ]
  },
  { 
    path: 'clients',
     canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/clients/listeclient/listeclient')
          .then(m => m.Listeclient)
      },
      {
        path: 'create',
        loadComponent: () => import('./components/clients/createclient/createclient')
          .then(m => m.Createclient)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/clients/createclient/createclient')
          .then(m => m.Createclient)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/clients/detailclient/detailclient')
          .then(m => m.Detailclient)
      }
    ]
  },
  {
    path: 'restauration',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/restaurations/listeresto/listeresto')
          .then(m => m.Listeresto)
      },
      {
        path: 'create',
        loadComponent: () => import('./components/restaurations/createresto/createresto')
          .then(m => m.Createresto)
      },{
        path: ':id/edit',
        loadComponent: () => import('./components/restaurations/createresto/createresto')
          .then(m => m.Createresto)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/restaurations/detailresto/detailresto')
          .then(m => m.Detailresto)
      }
    ]
  },
  { 
    path: 'stocks',
     canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/stocks/listestock/listestock')
          .then(m => m.Listestock)
      },
      {
        path: 'create',
        loadComponent: () => import('./components/stocks/createstock/createstock')
          .then(m => m.Createstock)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/stocks/createstock/createstock')
          .then(m => m.Createstock)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/stocks/detailstock/detailstock')
          .then(m => m.Detailstock)
      }
    ]
  },
  { 
    path: 'finances',
     canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/finances/listefinance/listefinance')
          .then(m => m.Listefinance)
      },
      {
        path: 'create',
        loadComponent: () => import('./components/finances/creatfinance/creatfinance')
          .then(m => m.Creatfinance)
      },
       {
        path: ':id/edit',
        loadComponent: () => import('./components/finances/creatfinance/creatfinance')
          .then(m => m.Creatfinance)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/finances/detailfinance/detailfinance')
          .then(m => m.Detailfinance)
      }
    ]
  },
  { 
    path: 'profile',
     canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/profile/detailprofile/detailprofile')
          .then(m => m.Detailprofile)
      },
       {
        path: 'edit',
        loadComponent: () => import('./components/profile/edite-profile/edite-profile')
          .then(m => m.EditeProfile)
      },
      {
        path: 'change-password',
        loadComponent: () => import('./components/profile/change-password/change-password')
          .then(m => m.ChangePassword)
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/unauthorized/unauthorized.component')
      .then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: '/accueil'
  }
];