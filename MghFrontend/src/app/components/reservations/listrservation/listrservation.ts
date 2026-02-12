import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MessageService, ConfirmationService } from 'primeng/api';

// Models & Services
import { 
  Reservation, 
  StatutReservation, 
  StatutPaiement,
  STATUT_RESERVATION_LABELS,
  STATUT_PAIEMENT_LABELS 
} from '../../../models/reservation.model ';
import { ReservationService } from '../../../services/reservation.service';

interface StatutOption {
  label: string;
  value: StatutReservation | '';
};
type Severity = "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | null | undefined;

@Component({
  selector: 'app-listrservation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TagModule,
    CardModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './listrservation.html',
  styleUrl: './listrservation.css'
})
export class Listrservation implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  loading = false;

  // Filtres
  searchText = '';
  selectedStatut: StatutReservation | '' = '';
  dateDebutFilter: Date | null = null;
  dateFinFilter: Date | null = null;

  // Options pour les dropdowns
  statutOptions: StatutOption[] = [
    { label: 'Tous les statuts', value: '' },
    { label: 'En attente', value: StatutReservation.EN_ATTENTE },
    { label: 'Confirmée', value: StatutReservation.CONFIRMEE },
    { label: 'En cours', value: StatutReservation.EN_COURS },
    { label: 'Terminée', value: StatutReservation.TERMINEE },
    { label: 'Annulée', value: StatutReservation.ANNULEE },
    { label: 'No-show', value: StatutReservation.NO_SHOW }
  ];

  // Statistiques
  stats = {
    total: 0,
    enAttente: 0,
    confirmees: 0,
    enCours: 0,
    aujourdhuiArrivees: 0,
    aujourdhuiDeparts: 0
  };

  constructor(
    private reservationService: ReservationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (response) => {
        if (response.success) {
          this.reservations = response.data;
          this.filteredReservations = [...this.reservations];
          this.calculateStats();
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Réservations chargées avec succès'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des réservations'
        });
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredReservations = this.reservations.filter(reservation => {
      // Filtre par texte de recherche
      const matchesSearch = !this.searchText || 
        reservation.numeroReservation?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        reservation.clientNom?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        reservation.clientPrenom?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        reservation.chambreNumero?.toLowerCase().includes(this.searchText.toLowerCase());

      // Filtre par statut
      const matchesStatut = !this.selectedStatut || reservation.statut === this.selectedStatut;

      // Filtre par date de début
      const matchesDateDebut = !this.dateDebutFilter || 
        new Date(reservation.dateArrivee) >= this.dateDebutFilter;

      // Filtre par date de fin
      const matchesDateFin = !this.dateFinFilter || 
        new Date(reservation.dateDepart) <= this.dateFinFilter;

      return matchesSearch && matchesStatut && matchesDateDebut && matchesDateFin;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatut = '';
    this.dateDebutFilter = null;
    this.dateFinFilter = null;
    this.filteredReservations = [...this.reservations];
  }

  calculateStats(): void {
    this.stats.total = this.reservations.length;
    this.stats.enAttente = this.reservations.filter(r => r.statut === StatutReservation.EN_ATTENTE).length;
    this.stats.confirmees = this.reservations.filter(r => r.statut === StatutReservation.CONFIRMEE).length;
    this.stats.enCours = this.reservations.filter(r => r.statut === StatutReservation.EN_COURS).length;

    const today = new Date().toISOString().split('T')[0];
    this.stats.aujourdhuiArrivees = this.reservations.filter(r => {
      const arrivalDate = new Date(r.dateArrivee).toISOString().split('T')[0];
      return arrivalDate === today;
    }).length;

    this.stats.aujourdhuiDeparts = this.reservations.filter(r => {
      const departureDate = new Date(r.dateDepart).toISOString().split('T')[0];
      return departureDate === today;
    }).length;
  }

  viewReservation(reservation: Reservation): void {
    this.router.navigate(['/reservations/detail', reservation.id]);
  }

  doCheckin(reservation: Reservation): void {
    if (reservation.statut !== StatutReservation.CONFIRMEE) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Seules les réservations confirmées peuvent faire l\'objet d\'un check-in'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Confirmer le check-in pour ${reservation.clientPrenom} ${reservation.clientNom} ?`,
      header: 'Confirmation Check-in',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.reservationService.doCheckin(reservation.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Check-in effectué avec succès'
              });
              this.loadReservations();
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

  doCheckout(reservation: Reservation): void {
    if (reservation.statut !== StatutReservation.EN_COURS) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Seules les réservations en cours peuvent faire l\'objet d\'un check-out'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Confirmer le check-out pour ${reservation.clientPrenom} ${reservation.clientNom} ?`,
      header: 'Confirmation Check-out',
      icon: 'pi pi-sign-out',
      accept: () => {
        this.reservationService.doCheckout(reservation.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Check-out effectué avec succès'
              });
              this.loadReservations();
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

  cancelReservation(reservation: Reservation): void {
    if (reservation.statut === StatutReservation.TERMINEE) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Impossible d\'annuler une réservation terminée'
      });
      return;
    }

    if (reservation.statut === StatutReservation.EN_COURS) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Effectuez d\'abord le check-out avant d\'annuler'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir annuler la réservation ${reservation.numeroReservation} ?`,
      header: 'Confirmation d\'annulation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.reservationService.cancelReservation(reservation.id!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Réservation annulée avec succès'
              });
              this.loadReservations();
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

  createReservation(): void {
    this.router.navigate(['/reservation/create']);
  }

  getStatutSeverity(statut: StatutReservation | undefined): Severity {
    switch (statut) {
      case StatutReservation.CONFIRMEE:
        return 'success';
      case StatutReservation.EN_COURS:
        return 'info';
      case StatutReservation.EN_ATTENTE:
        return 'warn'; // ✅ CHANGÉ: 'warn' au lieu de 'warning'
      case StatutReservation.ANNULEE:
      case StatutReservation.NO_SHOW:
        return 'danger';
      case StatutReservation.TERMINEE:
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getStatutPaiementSeverity(statut: StatutPaiement | undefined): Severity {
    switch (statut) {
      case StatutPaiement.PAYE:
        return 'success';
      case StatutPaiement.ACOMPTE:
        return 'warn'; // ✅ CHANGÉ: 'warn' au lieu de 'warning'
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

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  }
}