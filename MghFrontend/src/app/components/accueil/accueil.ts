import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [ButtonModule, CardModule, RouterModule, CommonModule],
  templateUrl: './accueil.html',
})
export class Accueil {
  features = [
    {
      title: 'Gestion des Réservations',
      icon: 'pi-calendar',
      description: 'Réservations, check-in, check-out et disponibilité en temps réel.'
    },
    {
      title: 'Gestion des Chambres',
      icon: 'pi-home',
      description: 'Suivi des chambres, ménage, maintenance et occupation.'
    },
    {
      title: 'Restauration',
      icon: 'pi-shopping-cart',
      description: 'Restaurant, bar, room service et facturation.'
    },
    {
      title: 'Comptabilité & Finance',
      icon: 'pi-wallet',
      description: 'Paiements, factures, rapports financiers automatisés.'
    },
    {
      title: 'Rapports & Statistiques',
      icon: 'pi-chart-line',
      description: 'Analyse des performances et indicateurs clés.'
    },
    {
      title: 'Gestion du Personnel',
      icon: 'pi-users',
      description: 'Employés, rôles, planning et suivi.'
    }
  ];
}
