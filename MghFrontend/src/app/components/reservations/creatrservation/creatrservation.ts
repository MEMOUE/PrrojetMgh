import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

// PrimeNG Imports
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services et Models
import { ReservationService } from '../../../services/reservation.service';
import { ChambreService } from '../../../services/chambre.service';
import { ClientService } from '../../../services/client.service';
import { CreateReservationRequest, Client, ModePaiement } from '../../../models/reservation.model';
import { Chambre, TYPE_CHAMBRE_LABELS } from '../../../models/hotel.model';
import { Client as ClientModel } from '../../../models/client.model';

@Component({
  selector: 'app-creatrservation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    StepsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
    RadioButtonModule,
    DividerModule,
    ToastModule,
    ToolbarModule,
    TagModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './creatrservation.html',
  styleUrl: './creatrservation.css'
})
export class Creatrservation implements OnInit {
  readonly TYPE_CHAMBRE_LABELS = TYPE_CHAMBRE_LABELS;

  // État du wizard
  activeIndex: number = 0;
  loading: boolean = false;
  isEditMode: boolean = false;
  reservationId?: number;

  // Formulaires
  datesForm!: FormGroup;
  clientForm!: FormGroup;
  paiementForm!: FormGroup;

  // Données
  chambresDisponibles: Chambre[] = [];
  selectedChambre?: Chambre;
  clientType: 'nouveau' | 'existant' = 'nouveau';

  // ✅ NOUVEAU : liste des clients existants pour le Select
  clientsExistants: { label: string; value: number; telephone: string }[] = [];
  clientsLoading: boolean = false;

  // Options pour les dropdowns
  typePieceOptions = [
    { label: 'Carte d\'identité nationale', value: 'CNI' },
    { label: 'Passeport', value: 'PASSEPORT' },
    { label: 'Permis de conduire', value: 'PERMIS' },
    { label: 'Attestation d\'identité', value: 'ATTESTATION' },
    { label: 'Autre document', value: 'AUTRE' }
  ];

  modePaiementOptions = [
    { label: '💵 Espèces', value: 'ESPECES' },
    { label: '💳 Carte bancaire', value: 'CARTE_BANCAIRE' },
    { label: '🏦 Virement bancaire', value: 'VIREMENT' },
    { label: '📱 Orange Money', value: 'ORANGE_MONEY' },
    { label: '📱 MTN Money', value: 'MTN_MONEY' },
    { label: '📱 Wave', value: 'WAVE' },
    { label: '📱 Moov Money', value: 'MOOV_MONEY' }
  ];

  items = [
    { label: 'Dates & Chambre' },
    { label: 'Informations Client' },
    { label: 'Paiement & Notes' },
    { label: 'Confirmation' }
  ];

  minDate: Date = new Date();
  nombreNuits: number = 0;
  montantTotal: number = 0;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private chambreService: ChambreService,
    private clientService: ClientService,        // ✅ NOUVEAU
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.checkEditMode();
  }

  private initForms(): void {
    this.datesForm = this.fb.group({
      chambreId: [null, Validators.required],
      dateArrivee: [null, Validators.required],
      dateDepart: [null, Validators.required],
      nombreAdultes: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      nombreEnfants: [0, [Validators.min(0), Validators.max(10)]]
    });

    this.clientForm = this.fb.group({
      clientId: [null],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-()]+$/)]],
      email: ['', [Validators.email]],
      typePiece: [''],
      pieceIdentite: [''],
      dateNaissance: [null],
      nationalite: [''],
      adresse: [''],
      ville: [''],
      pays: ['Côte d\'Ivoire'],
      notes: ['']
    });

    this.paiementForm = this.fb.group({
      montantPaye: [0, [Validators.min(0)]],
      modePaiement: [null],
      demandesSpeciales: [''],
      referenceExterne: ['']
    });

    this.datesForm.get('dateArrivee')?.valueChanges.subscribe(() => {
      this.checkDatesAndLoadChambres();
    });

    this.datesForm.get('dateDepart')?.valueChanges.subscribe(() => {
      this.checkDatesAndLoadChambres();
    });

    this.paiementForm.get('montantPaye')?.valueChanges.subscribe((montant) => {
      const modePaiementControl = this.paiementForm.get('modePaiement');
      if (montant && montant > 0) {
        modePaiementControl?.setValidators([Validators.required]);
      } else {
        modePaiementControl?.clearValidators();
      }
      modePaiementControl?.updateValueAndValidity();
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.reservationId = +id;
      this.loadReservation(this.reservationId);
    }
  }

  private loadReservation(id: number): void {
    this.loading = true;
    this.reservationService.getReservationById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const reservation = response.data;

          // ✅ Pré-remplir les dates et la chambre
          this.datesForm.patchValue({
            chambreId: reservation.chambreId,
            dateArrivee: new Date(reservation.dateArrivee),
            dateDepart: new Date(reservation.dateDepart),
            nombreAdultes: reservation.nombreAdultes,
            nombreEnfants: reservation.nombreEnfants
          });

          // ✅ Calculer les nuits et montant
          this.nombreNuits = reservation.nombreNuits ?? 0;
          this.montantTotal = reservation.montantTotal ?? 0;

          // ✅ Pré-remplir les infos client (mode existant)
          this.clientType = 'existant';
          this.loadClients(() => {
            this.clientForm.patchValue({ clientId: reservation.clientId });
          });
          this.onClientTypeChange('existant');

          // ✅ Pré-remplir le paiement et les notes
          this.paiementForm.patchValue({
            demandesSpeciales: reservation.demandesSpeciales,
            referenceExterne: reservation.referenceExterne,
            montantPaye: reservation.montantPaye ?? 0,
            modePaiement: reservation.modePaiement ?? null
          });

          // ✅ En mode édition, aller directement à l'étape 2 (Paiement & Notes)
          // car les dates/chambre ne sont pas modifiables selon le backend
          this.activeIndex = 2;
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur de chargement',
          detail: 'Impossible de charger la réservation pour modification'
        });
        this.loading = false;
        this.router.navigate(['/reservation']);
      }
    });
  }

  // ✅ NOUVEAU : Charger les clients existants depuis l'API
  loadClients(callback?: () => void): void {
    this.clientsLoading = true;
    this.clientService.getClients().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clientsExistants = response.data.map((c: ClientModel) => ({
            label: `${c.prenom} ${c.nom} — ${c.telephone}`,
            value: c.id!,
            telephone: c.telephone
          }));
        }
        this.clientsLoading = false;
        callback?.();
      },
      error: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Attention',
          detail: 'Impossible de charger la liste des clients'
        });
        this.clientsLoading = false;
        callback?.();
      }
    });
  }

  private checkDatesAndLoadChambres(): void {
    const dateArrivee = this.datesForm.get('dateArrivee')?.value;
    const dateDepart = this.datesForm.get('dateDepart')?.value;

    if (dateArrivee && dateDepart) {
      if (dateDepart <= dateArrivee) {
        this.datesForm.get('dateDepart')?.setErrors({ invalidDate: true });
        this.messageService.add({
          severity: 'warn',
          summary: 'Dates invalides',
          detail: 'La date de départ doit être après la date d\'arrivée'
        });
        return;
      }

      this.loadChambresDisponibles(dateArrivee, dateDepart);
      this.calculateNombreNuits();
    }
  }

  private loadChambresDisponibles(dateArrivee: Date, dateDepart: Date): void {
    this.loading = true;
    const dateArriveeStr = this.formatDateForAPI(dateArrivee);
    const dateDepartStr = this.formatDateForAPI(dateDepart);

    this.chambreService.getChambresDisponibles(dateArriveeStr, dateDepartStr).subscribe({
      next: (chambres) => {
        this.chambresDisponibles = chambres;
        if (this.chambresDisponibles.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Aucune chambre disponible',
            detail: 'Aucune chambre n\'est disponible pour ces dates'
          });
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les chambres disponibles'
        });
        this.chambresDisponibles = [];
        this.loading = false;
      }
    });
  }

  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onChambreSelect(event: any): void {
    const chambreId = event.value;
    this.selectedChambre = this.chambresDisponibles.find(c => c.id === chambreId);
    this.calculateMontantTotal();
  }

  private calculateNombreNuits(): void {
    const dateArrivee = this.datesForm.get('dateArrivee')?.value;
    const dateDepart = this.datesForm.get('dateDepart')?.value;
    if (dateArrivee && dateDepart) {
      const diff = dateDepart.getTime() - dateArrivee.getTime();
      this.nombreNuits = Math.ceil(diff / (1000 * 3600 * 24));
      this.calculateMontantTotal();
    }
  }

  private calculateMontantTotal(): void {
    if (this.selectedChambre && this.nombreNuits > 0) {
      this.montantTotal = this.selectedChambre.prixParNuit * this.nombreNuits;
    }
  }

  nextStep(): void {
    // ✅ En mode édition, le wizard commence à l'étape 2
    // Pas de validation de dates/chambre requise
    if (this.isEditMode) {
      if (this.activeIndex < 3) {
        this.activeIndex++;
      }
      return;
    }

    const currentForm = this.getCurrentForm();
    if (currentForm.valid) {
      if (this.activeIndex === 0 && !this.selectedChambre) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Sélection requise',
          detail: 'Veuillez sélectionner une chambre'
        });
        return;
      }
      this.activeIndex++;
    } else {
      this.markFormGroupTouched(currentForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulaire incomplet',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
    }
  }

  prevStep(): void {
    if (this.activeIndex > 0) {
      // ✅ En mode édition, ne pas remonter avant l'étape 2
      if (this.isEditMode && this.activeIndex <= 2) return;
      this.activeIndex--;
    }
  }

  private getCurrentForm(): FormGroup {
    switch (this.activeIndex) {
      case 0: return this.datesForm;
      case 1: return this.clientForm;
      case 2: return this.paiementForm;
      default: return this.datesForm;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  onClientTypeChange(type: 'nouveau' | 'existant'): void {
    this.clientType = type;

    if (type === 'existant') {
      // ✅ Charger les clients si pas encore fait
      if (this.clientsExistants.length === 0) {
        this.loadClients();
      }

      this.clientForm.patchValue({
        prenom: '', nom: '', telephone: '', email: '',
        typePiece: '', pieceIdentite: '', dateNaissance: null,
        nationalite: '', adresse: '', ville: '', pays: '', notes: ''
      });

      Object.keys(this.clientForm.controls).forEach(key => {
        if (key !== 'clientId') {
          this.clientForm.get(key)?.disable();
          this.clientForm.get(key)?.clearValidators();
        } else {
          this.clientForm.get(key)?.setValidators([Validators.required]);
        }
        this.clientForm.get(key)?.updateValueAndValidity();
      });
    } else {
      Object.keys(this.clientForm.controls).forEach(key => {
        if (key !== 'clientId') {
          this.clientForm.get(key)?.enable();
        } else {
          this.clientForm.get(key)?.clearValidators();
        }
      });

      this.clientForm.get('prenom')?.setValidators([Validators.required, Validators.minLength(2)]);
      this.clientForm.get('nom')?.setValidators([Validators.required, Validators.minLength(2)]);
      this.clientForm.get('telephone')?.setValidators([Validators.required]);

      Object.keys(this.clientForm.controls).forEach(key => {
        this.clientForm.get(key)?.updateValueAndValidity();
      });
    }
  }

  // ✅ MODIFIÉ : confirmerReservation gère création ET modification
  confirmerReservation(): void {
    if (this.isEditMode) {
      this.updateReservation();
      return;
    }
    this.createReservation();
  }

  private createReservation(): void {
    if (!this.datesForm.valid || !this.clientForm.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Formulaire invalide',
        detail: 'Veuillez vérifier toutes les informations saisies'
      });
      return;
    }

    this.loading = true;

    const request: CreateReservationRequest = {
      chambreId: this.datesForm.value.chambreId,
      dateArrivee: this.formatDateForAPI(this.datesForm.value.dateArrivee),
      dateDepart: this.formatDateForAPI(this.datesForm.value.dateDepart),
      nombreAdultes: this.datesForm.value.nombreAdultes,
      nombreEnfants: this.datesForm.value.nombreEnfants || 0,
      notes: this.clientForm.value.notes,
      demandesSpeciales: this.paiementForm.value.demandesSpeciales,
      referenceExterne: this.paiementForm.value.referenceExterne
    };

    if (this.paiementForm.value.montantPaye && this.paiementForm.value.montantPaye > 0) {
      if (this.paiementForm.value.montantPaye > this.montantTotal) {
        this.messageService.add({
          severity: 'error',
          summary: 'Montant invalide',
          detail: 'Le montant payé ne peut pas dépasser le montant total'
        });
        this.loading = false;
        return;
      }
      (request as any).montantPaye = this.paiementForm.value.montantPaye;
      (request as any).modePaiement = this.paiementForm.value.modePaiement;
    }

    if (this.clientType === 'nouveau') {
      const newClient: Client = {
        prenom: this.clientForm.value.prenom,
        nom: this.clientForm.value.nom,
        telephone: this.clientForm.value.telephone,
        email: this.clientForm.value.email || undefined,
        typePiece: this.clientForm.value.typePiece || undefined,
        pieceIdentite: this.clientForm.value.pieceIdentite || undefined,
        dateNaissance: this.clientForm.value.dateNaissance
          ? this.formatDateForAPI(this.clientForm.value.dateNaissance)
          : undefined,
        nationalite: this.clientForm.value.nationalite || undefined,
        adresse: this.clientForm.value.adresse || undefined,
        ville: this.clientForm.value.ville || undefined,
        pays: this.clientForm.value.pays || undefined,
        notes: this.clientForm.value.notes || undefined
      };
      request.newClient = newClient;
    } else {
      request.clientId = this.clientForm.value.clientId;
    }

    this.reservationService.createReservation(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.messageService.add({
            severity: 'success',
            summary: 'Réservation créée',
            detail: `Réservation N° ${response.data.numeroReservation} créée avec succès`
          });
          setTimeout(() => this.router.navigate(['/reservation']), 1500);
        }
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.message || 'Une erreur est survenue lors de la création'
        });
      }
    });
  }

  // ✅ NOUVEAU : méthode dédiée à la modification
  private updateReservation(): void {
    if (!this.reservationId) return;
    this.loading = true;

    const updateData: any = {
      nombreAdultes: this.datesForm.value.nombreAdultes,
      nombreEnfants: this.datesForm.value.nombreEnfants || 0,
      notes: this.clientForm.value.notes,
      demandesSpeciales: this.paiementForm.value.demandesSpeciales,
      referenceExterne: this.paiementForm.value.referenceExterne
    };

    this.reservationService.updateReservation(this.reservationId, updateData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Réservation modifiée',
            detail: 'La réservation a été mise à jour avec succès'
          });
          setTimeout(() => this.router.navigate(['/reservation/detail', this.reservationId]), 1500);
        }
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.message || 'Une erreur est survenue lors de la modification'
        });
      }
    });
  }

  annuler(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Toutes les données saisies seront perdues.')) {
      this.router.navigate(['/reservation']);
    }
  }

  // ============================================================================
  // MÉTHODES HELPER
  // ============================================================================

  getTypeLabel(type: string): string {
    return this.TYPE_CHAMBRE_LABELS[type as keyof typeof TYPE_CHAMBRE_LABELS] || type;
  }

  get montantRestant(): number {
    const montantPaye = this.paiementForm.value.montantPaye || 0;
    return Math.max(0, this.montantTotal - montantPaye);
  }

  get formattedMontantTotal(): string {
    return this.montantTotal.toLocaleString('fr-FR') + ' FCFA';
  }

  get formattedMontantPaye(): string {
    const montant = this.paiementForm.value.montantPaye || 0;
    return montant.toLocaleString('fr-FR') + ' FCFA';
  }

  get formattedMontantRestant(): string {
    return this.montantRestant.toLocaleString('fr-FR') + ' FCFA';
  }

  getChambreLabel(chambre: Chambre): string {
    const typeLabel = this.getTypeLabel(chambre.type);
    return `Chambre ${chambre.numero} - ${typeLabel} (${chambre.prixParNuit.toLocaleString('fr-FR')} FCFA/nuit)`;
  }

  getPaymentSeverity(): 'success' | 'warn' | 'danger' {
    if (this.montantRestant === 0) return 'success';
    if (this.montantRestant === this.montantTotal) return 'danger';
    return 'warn';
  }

  getPaymentLabel(): string {
    if (this.montantRestant === 0) return 'Payé intégralement';
    if (this.montantRestant === this.montantTotal) return 'Non payé';
    return 'Acompte versé';
  }

  getChambrePrixFormate(): string {
    return this.selectedChambre
      ? this.selectedChambre.prixParNuit.toLocaleString('fr-FR') + ' FCFA'
      : '0 FCFA';
  }

  hasErrors(): boolean {
    const form = this.getCurrentForm();
    return form.invalid && form.touched;
  }
}
