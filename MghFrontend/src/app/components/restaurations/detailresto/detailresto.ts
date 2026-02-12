import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
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
  selector: 'app-detailresto',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './detailresto.html',
  styleUrl: './detailresto.css'
})
export class Detailresto implements OnInit {
  commande?: CommandeRestaurant;
  loading: boolean = false;
  commandeId!: number;

  constructor(
    private restaurantService: RestaurantService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.commandeId = +params['id'];
      this.loadCommande();
    });
  }

  loadCommande(): void {
    this.loading = true;
    this.restaurantService.getCommandeById(this.commandeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.commande = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la commande:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger la commande'
        });
        this.loading = false;
        this.retourListe();
      }
    });
  }

  changerStatut(nouveauStatut: StatutCommandeRestaurant): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment passer cette commande à "${STATUT_COMMANDE_LABELS[nouveauStatut]}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.restaurantService.updateStatut(this.commandeId, nouveauStatut).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Statut mis à jour avec succès'
              });
              this.loadCommande();
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

  ajouterPaiement(): void {
    if (!this.commande) return;

    const montantRestant = this.commande.montantTotal - (this.commande.montantPaye || 0);
    
    this.confirmationService.confirm({
      message: `Enregistrer un paiement de ${montantRestant.toLocaleString('fr-FR')} FCFA ?`,
      header: 'Paiement',
      icon: 'pi pi-money-bill',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.restaurantService.addPaiement(this.commandeId, montantRestant).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Paiement enregistré avec succès'
              });
              this.loadCommande();
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

  retourListe(): void {
    this.router.navigate(['/restauration']);
  }

  getStatutLabel(statut: StatutCommandeRestaurant): string {
    return STATUT_COMMANDE_LABELS[statut] || statut;
  }

  getStatutSeverity(statut: StatutCommandeRestaurant): Severity {
    return (STATUT_COMMANDE_COLORS[statut] || 'info') as Severity;
  }
  
  getClientDisplay(): string {
    if (!this.commande) return '';

    if (this.commande.clientNom) {
      return this.commande.clientNom;
    }
    if (this.commande.nomClientExterne) {
      return this.commande.nomClientExterne;
    }
    if (this.commande.reservationNumero) {
      return `Réservation ${this.commande.reservationNumero}`;
    }
    return 'Client non spécifié';
  }

  getMontantRestant(): number {
    if (!this.commande) return 0;
    return this.commande.montantTotal - (this.commande.montantPaye || 0);
  }

  canPasserEnPreparation(): boolean {
    return this.commande?.statut === StatutCommandeRestaurant.EN_ATTENTE;
  }

  canMarquerPrete(): boolean {
    return this.commande?.statut === StatutCommandeRestaurant.EN_PREPARATION;
  }

  canMarquerServie(): boolean {
    return this.commande?.statut === StatutCommandeRestaurant.PRETE;
  }

  canMarquerPayee(): boolean {
    return this.commande?.statut === StatutCommandeRestaurant.SERVIE;
  }

  canAjouterPaiement(): boolean {
    if (!this.commande) return false;
    const montantRestant = this.getMontantRestant();
    return montantRestant > 0 && this.commande.statut !== StatutCommandeRestaurant.ANNULEE;
  }

  passerEnPreparation(): void {
    this.changerStatut(StatutCommandeRestaurant.EN_PREPARATION);
  }

  marquerPrete(): void {
    this.changerStatut(StatutCommandeRestaurant.PRETE);
  }

  marquerServie(): void {
    this.changerStatut(StatutCommandeRestaurant.SERVIE);
  }

  marquerPayee(): void {
    this.changerStatut(StatutCommandeRestaurant.PAYEE);
  }

  imprimer(): void {
    window.print();
  }
}