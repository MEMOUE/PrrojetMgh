import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { PermissionService, Permission } from '../../services/permission.service';

interface DashboardModule {
  title: string;
  description: string;
  icon: string;
  route: string;
  gradient: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-dashboad-hotel',
  standalone: true,
  imports: [CardModule, ButtonModule, RouterModule, NgClass],
  templateUrl: './dashboad-hotel.html',
  styleUrl: './dashboad-hotel.css'
})
export class DashboadHotel implements OnInit {

  visibleModules: DashboardModule[] = [];

  private allModules: DashboardModule[] = [
    {
      title: 'Réservations',
      description: 'Réservations, check-in, check-out.',
      icon: 'pi-calendar',
      route: '/reservation',
      gradient: 'from-blue-500 to-indigo-600',
      permissions: [Permission.VOIR_RESERVATIONS, Permission.CREER_RESERVATION]
    },
    {
      title: 'Chambres',
      description: 'Gestion des chambres et housekeeping.',
      icon: 'pi-building',
      route: '/chambres',
      gradient: 'from-emerald-500 to-green-600',
      permissions: [Permission.VOIR_RESERVATIONS, Permission.VOIR_CONFIGURATION]
    },
    {
      title: 'Restauration',
      description: 'Restaurant, bar et room service.',
      icon: 'pi-shopping-cart',
      route: '/restauration',
      gradient: 'from-orange-500 to-amber-600',
      permissions: [Permission.VOIR_COMMANDES, Permission.CREER_COMMANDE]
    },
    {
      title: 'Stocks',
      description: 'Produits, inventaires et fournisseurs.',
      icon: 'pi-box',
      route: '/stocks',
      gradient: 'from-purple-500 to-fuchsia-600',
      permissions: [Permission.VOIR_STOCK, Permission.MODIFIER_STOCK]
    },
    {
      title: 'Finance',
      description: 'Facturation et finances.',
      icon: 'pi-wallet',
      route: '/finances',
      gradient: 'from-rose-500 to-red-600',
      permissions: [Permission.VOIR_COMPTABILITE, Permission.MODIFIER_COMPTABILITE]
    },
    {
      title: 'Personnel',
      description: 'Employés et plannings.',
      icon: 'pi-users',
      route: '/employes',
      gradient: 'from-teal-500 to-emerald-600',
      permissions: [Permission.VOIR_EMPLOYES, Permission.GERER_EMPLOYES]
    },
    {
      title: 'Clients',
      description: 'Gestion des Clients.',
      icon: 'pi-user-edit',
      route: '/clients',
      gradient: 'from-teal-500 to-sky-100',
      permissions: [Permission.VOIR_RESERVATIONS, Permission.CREER_RESERVATION]
    },
    {
      title: 'Paramètres',
      description: "Paramètres de l'hôtel.",
      icon: 'pi-cog',
      route: '/profile',
      gradient: 'from-teal-500 to-sky-900',
      permissions: [Permission.VOIR_CONFIGURATION, Permission.MODIFIER_CONFIGURATION]
    },
    {
      title: 'Planning',
      description: 'Planning des Réservations.',
      icon: 'pi-chart-line',
      route: '/planning',
      gradient: 'from-cyan-500 to-sky-600',
      permissions: [Permission.VOIR_RESERVATIONS]
    }
  ];

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.visibleModules = this.allModules.filter(mod => {
      if (this.permissionService.isHotelAccount) return true;
      return this.permissionService.hasAnyPermission(...mod.permissions);
    });
  }
}
