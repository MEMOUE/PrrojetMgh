import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

import { MessageService, ConfirmationService } from 'primeng/api';

// Models & Services
import { 
  Reservation, 
  StatutReservation, 
  StatutPaiement,
  ModePaiement,
  STATUT_RESERVATION_LABELS,
  STATUT_PAIEMENT_LABELS 
} from '../../../models/reservation.model ';
import { ReservationService } from '../../../services/reservation.service';

interface ModePaiementOption {
  label: string;
  value: string;
};
type Severity = "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | null | undefined;

@Component({
  selector: 'app-detail-reservation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    SelectModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './detail-reservation.html',
  styleUrl: './detail-reservation.css'
})
export class DetailReservation implements OnInit {
  reservation: Reservation | null = null;
  loading = false;
  
  // Dialog pour paiement
  showPaiementDialog = false;
  montantPaiement: number = 0;
  modePaiementSelected: string = '';

  modesPaiementOptions: ModePaiementOption[] = [
    { label: 'Espèces', value: 'ESPECES' },
    { label: 'Carte bancaire', value: 'CARTE_BANCAIRE' },
    { label: 'Virement', value: 'VIREMENT' },
    { label: 'Chèque', value: 'CHEQUE' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' },
    { label: 'Orange Money', value: 'ORANGE_MONEY' },
    { label: 'MTN Money', value: 'MTN_MONEY' },
    { label: 'Wave', value: 'WAVE' },
    { label: 'Moov Money', value: 'MOOV_MONEY' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReservation(+id);
    }
  }

  loadReservation(id: number): void {
    this.loading = true;
    this.reservationService.getReservationById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.reservation = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Réservation non trouvée'
          });
          this.router.navigate(['/reservations']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement de la réservation'
        });
        this.loading = false;
        this.router.navigate(['/reservations']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/reservations']);
  }

  doCheckin(): void {
    if (!this.reservation || this.reservation.statut !== StatutReservation.CONFIRMEE) {
      return;
    }

    this.confirmationService.confirm({
      message: `Confirmer le check-in pour ${this.reservation.clientPrenom} ${this.reservation.clientNom} ?`,
      header: 'Confirmation Check-in',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.reservationService.doCheckin(this.reservation!.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Check-in effectué avec succès'
              });
              this.loadReservation(this.reservation!.id!);
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.message || 'Erreur lors du check-in'
            });
          }
        });
      }
    });
  }

  doCheckout(): void {
    if (!this.reservation || this.reservation.statut !== StatutReservation.EN_COURS) {
      return;
    }

    this.confirmationService.confirm({
      message: `Confirmer le check-out pour ${this.reservation.clientPrenom} ${this.reservation.clientNom} ?`,
      header: 'Confirmation Check-out',
      icon: 'pi pi-sign-out',
      accept: () => {
        this.reservationService.doCheckout(this.reservation!.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Check-out effectué avec succès'
              });
              this.loadReservation(this.reservation!.id!);
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.message || 'Erreur lors du check-out'
            });
          }
        });
      }
    });
  }

  cancelReservation(): void {
    if (!this.reservation) return;

    if (this.reservation.statut === StatutReservation.TERMINEE) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Impossible d\'annuler une réservation terminée'
      });
      return;
    }

    if (this.reservation.statut === StatutReservation.EN_COURS) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Effectuez d\'abord le check-out avant d\'annuler'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir annuler la réservation ${this.reservation.numeroReservation} ?`,
      header: 'Confirmation d\'annulation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.reservationService.cancelReservation(this.reservation!.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Réservation annulée avec succès'
              });
              this.loadReservation(this.reservation!.id!);
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: error.message || 'Erreur lors de l\'annulation'
            });
          }
        });
      }
    });
  }

  openPaiementDialog(): void {
    if (!this.reservation) return;
    
    this.montantPaiement = 0;
    this.modePaiementSelected = '';
    this.showPaiementDialog = true;
  }

  savePaiement(): void {
    if (!this.reservation || !this.montantPaiement || !this.modePaiementSelected) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs'
      });
      return;
    }

    if (this.montantPaiement <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Le montant doit être supérieur à 0'
      });
      return;
    }

    if (this.reservation.montantRestant && this.montantPaiement > this.reservation.montantRestant) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Le montant dépasse le montant restant'
      });
      return;
    }

    this.reservationService.addPaiement(
      this.reservation.id!,
      {
        montant: this.montantPaiement,
        modePaiement: this.modePaiementSelected
      }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Paiement enregistré avec succès'
          });
          this.showPaiementDialog = false;
          this.loadReservation(this.reservation!.id!);
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.message || 'Erreur lors de l\'enregistrement du paiement'
        });
      }
    });
  }

  getStatutSeverity(statut: StatutReservation | undefined): Severity {
    switch (statut) {
      case StatutReservation.CONFIRMEE:
        return 'success';
      case StatutReservation.EN_COURS:
        return 'info';
      case StatutReservation.EN_ATTENTE:
        return 'warn';
      case StatutReservation.ANNULEE:
        return 'danger';
      case StatutReservation.TERMINEE:
        return 'secondary';
      case StatutReservation.NO_SHOW:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatutPaiementSeverity(statut: StatutPaiement | undefined): Severity {
    switch (statut) {
      case StatutPaiement.PAYE:
        return 'success';
      case StatutPaiement.ACOMPTE:
        return 'warn';
      case StatutPaiement.NON_PAYE:
        return 'danger';
      case StatutPaiement.REMBOURSE:
        return 'info';
      default:
        return 'secondary';
    }
  }

  getStatutLabel(statut: StatutReservation | undefined): string {
    return statut ? STATUT_RESERVATION_LABELS[statut] : '';
  }

  getStatutPaiementLabel(statut: StatutPaiement | undefined): string {
    return statut ? STATUT_PAIEMENT_LABELS[statut] : '';
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatDateTime(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleString('fr-FR');
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  }

  canCheckin(): boolean {
    return this.reservation?.statut === StatutReservation.CONFIRMEE;
  }

  canCheckout(): boolean {
    return this.reservation?.statut === StatutReservation.EN_COURS;
  }

  canCancel(): boolean {
    return this.reservation?.statut !== StatutReservation.TERMINEE && 
           this.reservation?.statut !== StatutReservation.ANNULEE &&
           this.reservation?.statut !== StatutReservation.EN_COURS;
  }

  canAddPaiement(): boolean {
    return this.reservation?.statut !== StatutReservation.ANNULEE &&
           this.reservation?.statutPaiement !== StatutPaiement.PAYE;
  }
}