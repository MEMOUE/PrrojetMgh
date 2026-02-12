import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import {NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'app-dashboad-hotel',
  standalone: true,
  imports: [CardModule, ButtonModule, RouterModule, NgForOf, NgClass],
  templateUrl: './dashboad-hotel.html',
  styleUrl: './dashboad-hotel.css'
})
export class DashboadHotel {

  modules = [
    {
      title: 'Réservations',
      description: 'Réservations, check-in, check-out.',
      icon: 'pi-calendar',
      route: '/reservation',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Chambres',
      description: 'Gestion des chambres et housekeeping.',
      icon: 'pi-building',
      route: '/chambres',
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      title: 'Restauration',
      description: 'Restaurant, bar et room service.',
      icon: 'pi-shopping-cart',
      route: '/restauration',
      gradient: 'from-orange-500 to-amber-600'
    },
    {
      title: 'Stocks',
      description: 'Produits, inventaires et fournisseurs.',
      icon: 'pi-box',
      route: '/stocks',
      gradient: 'from-purple-500 to-fuchsia-600'
    },
    {
      title: 'Finance',
      description: 'Facturation et finances.',
      icon: 'pi-wallet',
      route: '/finances',
      gradient: 'from-rose-500 to-red-600'
    },
    // {
    //   title: 'Rapports',
    //   description: 'Statistiques et performances.',
    //   icon: 'pi-chart-line',
    //   route: '/rapports',
    //   gradient: 'from-cyan-500 to-sky-600'
    // },
    {
      title: 'Personnel',
      description: 'Employés et plannings.',
      icon: 'pi-users',
      route: '/employes',
      gradient: 'from-teal-500 to-emerald-600'
    },
    {
      title: 'Clients',
      description: 'Gestion des Clients.',
      icon: 'pi-user-edit',
      route: '/clients',
      gradient: 'from-teal-500 to-sky-100'
    },
    {
      title: 'Paramettres',
      description: 'Paramettres de l\'hôtel.',
      icon: 'pi-cog',
      route: '/profile',
      gradient: 'from-teal-500 to-sky-900'
    }
  ];

}
