import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RestaurantService } from '../../../services/restaurant.service';
import { 
  CommandeRestaurant, 
  StatutCommandeRestaurant,
  STATUT_COMMANDE_LABELS,
  STATUT_COMMANDE_COLORS 
} from '../../../models/restaurant.model ';
type Severity = "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined;

@Component({
  selector: 'app-listeresto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './listeresto.html',
  styleUrl: './listeresto.css'
})
export class Listeresto implements OnInit {
  commandes: CommandeRestaurant[] = [];
  commandesFiltrees: CommandeRestaurant[] = [];
  loading: boolean = false;
  searchValue: string = '';
  selectedStatut: string = '';

  // Statistiques
  totalCommandes: number = 0;
  commandesEnAttente: number = 0;
  commandesEnCours: number = 0;
  montantTotal: number = 0;

  // Options de statut
  statutOptions = [
    { label: 'Tous les statuts', value: '' },
    { label: 'En attente', value: StatutCommandeRestaurant.EN_ATTENTE },
    { label: 'En préparation', value: StatutCommandeRestaurant.EN_PREPARATION },
    { label: 'Prête', value: StatutCommandeRestaurant.PRETE },
    { label: 'Servie', value: StatutCommandeRestaurant.SERVIE },
    { label: 'Payée', value: StatutCommandeRestaurant.PAYEE },
    { label: 'Annulée', value: StatutCommandeRestaurant.ANNULEE }
  ];

  constructor(
    private restaurantService: RestaurantService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.loading = true;
    this.restaurantService.getCommandes().subscribe({
      next: (response) => {
        if (response.success) {
          this.commandes = response.data;
          this.commandesFiltrees = this.commandes;
          this.calculerStatistiques();
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les commandes'
        });
        this.loading = false;
      }
    });
  }

  calculerStatistiques(): void {
    this.totalCommandes = this.commandes.length;
    this.commandesEnAttente = this.commandes.filter(
      c => c.statut === StatutCommandeRestaurant.EN_ATTENTE
    ).length;
    this.commandesEnCours = this.commandes.filter(
      c => c.statut === StatutCommandeRestaurant.EN_PREPARATION
    ).length;
    this.montantTotal = this.commandes
      .filter(c => c.statut !== StatutCommandeRestaurant.ANNULEE)
      .reduce((sum, c) => sum + c.montantTotal, 0);
  }

  applyFilters(): void {
    let filtered = [...this.commandes];

    // Filtre par recherche
    if (this.searchValue.trim()) {
      const search = this.searchValue.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.numeroCommande?.toLowerCase().includes(search) ||
        c.clientNom?.toLowerCase().includes(search) ||
        c.nomClientExterne?.toLowerCase().includes(search) ||
        c.numeroTable?.toLowerCase().includes(search) ||
        c.serveurNom?.toLowerCase().includes(search)
      );
    }

    // Filtre par statut
    if (this.selectedStatut) {
      filtered = filtered.filter(c => c.statut === this.selectedStatut);
    }

    this.commandesFiltrees = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatutChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchValue = '';
    this.selectedStatut = '';
    this.applyFilters();
  }

  nouvelleCommande(): void {
    this.router.navigate(['/restauration/create']);
  }

  viewCommande(commande: CommandeRestaurant): void {
    this.router.navigate(['/restauration', commande.id]);
  }

  changerStatut(commande: CommandeRestaurant, nouveauStatut: StatutCommandeRestaurant): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment passer cette commande à "${STATUT_COMMANDE_LABELS[nouveauStatut]}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.restaurantService.updateStatut(commande.id!, nouveauStatut).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Statut mis à jour avec succès'
              });
              this.loadCommandes();
            }
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour du statut:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.error?.message || 'Impossible de mettre à jour le statut'
            });
          }
        });
      }
    });
  }

  marquerCommeServie(commande: CommandeRestaurant): void {
    this.changerStatut(commande, StatutCommandeRestaurant.SERVIE);
  }

  marquerCommePayee(commande: CommandeRestaurant): void {
    this.changerStatut(commande, StatutCommandeRestaurant.PAYEE);
  }

  ajouterPaiement(commande: CommandeRestaurant): void {
    const montantRestant = commande.montantTotal - (commande.montantPaye || 0);
    
    // Vous pourriez ouvrir un dialog ici pour saisir le montant
    // Pour l'instant, on paie le montant restant
    this.confirmationService.confirm({
      message: `Enregistrer un paiement de ${montantRestant.toLocaleString('fr-FR')} FCFA ?`,
      header: 'Paiement',
      icon: 'pi pi-money-bill',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.restaurantService.addPaiement(commande.id!, montantRestant).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Paiement enregistré avec succès'
              });
              this.loadCommandes();
            }
          },
          error: (error) => {
            console.error('Erreur lors de l\'enregistrement du paiement:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.error?.message || 'Impossible d\'enregistrer le paiement'
            });
          }
        });
      }
    });
  }

  getStatutLabel(statut: StatutCommandeRestaurant): string {
    return STATUT_COMMANDE_LABELS[statut] || statut;
  }

  getStatutSeverity(statut: StatutCommandeRestaurant): Severity {
    return (STATUT_COMMANDE_COLORS[statut] || 'info') as Severity;
  }

  getClientDisplay(commande: CommandeRestaurant): string {
    if (commande.clientNom) {
      return commande.clientNom;
    }
    if (commande.nomClientExterne) {
      return commande.nomClientExterne;
    }
    if (commande.reservationNumero) {
      return `Réservation ${commande.reservationNumero}`;
    }
    return 'Client non spécifié';
  }

  canMarquerServie(commande: CommandeRestaurant): boolean {
    return commande.statut === StatutCommandeRestaurant.PRETE;
  }

  canMarquerPayee(commande: CommandeRestaurant): boolean {
    return commande.statut === StatutCommandeRestaurant.SERVIE;
  }

  canAjouterPaiement(commande: CommandeRestaurant): boolean {
    const montantRestant = commande.montantTotal - (commande.montantPaye || 0);
    return montantRestant > 0 && commande.statut !== StatutCommandeRestaurant.ANNULEE;
  }

  getMontantRestant(commande: CommandeRestaurant): number {
    return commande.montantTotal - (commande.montantPaye || 0);
  }
}