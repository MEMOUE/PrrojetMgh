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
import { CreateReservationRequest, Client, ModePaiement } from '../../../models/reservation.model ';
import { Chambre, TYPE_CHAMBRE_LABELS } from '../../../models/hotel.model';

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
  // Exposition de TYPE_CHAMBRE_LABELS pour le template
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

  // Items pour le stepper
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
          
          this.datesForm.patchValue({
            chambreId: reservation.chambreId,
            dateArrivee: new Date(reservation.dateArrivee),
            dateDepart: new Date(reservation.dateDepart),
            nombreAdultes: reservation.nombreAdultes,
            nombreEnfants: reservation.nombreEnfants
          });

          this.clientType = 'existant';
          this.clientForm.patchValue({
            clientId: reservation.clientId
          });

          this.paiementForm.patchValue({
            demandesSpeciales: reservation.demandesSpeciales
          });
        }
        this.loading = false;
      },
      error: (error) => {
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

    this.chambreService.getChambresDisponibles(
      dateArriveeStr,
      dateDepartStr
    ).subscribe({
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
      error: (error) => {
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
      this.clientForm.patchValue({
        prenom: '',
        nom: '',
        telephone: '',
        email: '',
        typePiece: '',
        pieceIdentite: '',
        dateNaissance: null,
        nationalite: '',
        adresse: '',
        ville: '',
        pays: '',
        notes: ''
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

  confirmerReservation(): void {
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
          
          setTimeout(() => {
            this.router.navigate(['/reservation']);
          }, 1500);
        }
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.message || 'Une erreur est survenue lors de la création de la réservation'
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
  // MÉTHODES HELPER POUR LE TEMPLATE
  // Ces méthodes aident à gérer les conversions de type et le formatage
  // ============================================================================

  /**
   * Obtient le label formaté d'un type de chambre de manière type-safe
   * Résout le problème d'indexation stricte de TypeScript
   * 
   * Explication du problème :
   * TYPE_CHAMBRE_LABELS est typé comme Record<TypeChambre, string>
   * Mais chambre.type vient de l'API comme un simple string
   * TypeScript refuse d'utiliser un string pour indexer un Record strict
   * 
   * Solution :
   * On fait une assertion de type avec 'as keyof typeof'
   * Cela dit à TypeScript : "Je garantis que ce string est une clé valide"
   * Le '|| type' fournit une valeur de secours si le type n'est pas trouvé
   */
  getTypeLabel(type: string): string {
    return this.TYPE_CHAMBRE_LABELS[type as keyof typeof TYPE_CHAMBRE_LABELS] || type;
  }

  /**
   * Retourne le montant restant à payer
   * Utilisé pour afficher le solde et déterminer le statut du paiement
   */
  get montantRestant(): number {
    const montantPaye = this.paiementForm.value.montantPaye || 0;
    return Math.max(0, this.montantTotal - montantPaye);
  }

  /**
   * Formate le montant total en FCFA avec séparateurs de milliers
   */
  get formattedMontantTotal(): string {
    return this.montantTotal.toLocaleString('fr-FR') + ' FCFA';
  }

  /**
   * Formate le montant payé en FCFA
   */
  get formattedMontantPaye(): string {
    const montant = this.paiementForm.value.montantPaye || 0;
    return montant.toLocaleString('fr-FR') + ' FCFA';
  }

  /**
   * Formate le montant restant en FCFA
   */
  get formattedMontantRestant(): string {
    return this.montantRestant.toLocaleString('fr-FR') + ' FCFA';
  }

  /**
   * Retourne le label complet pour une chambre dans le sélecteur
   * Utilise getTypeLabel pour gérer le type de manière sécurisée
   */
  getChambreLabel(chambre: Chambre): string {
    const typeLabel = this.getTypeLabel(chambre.type);
    return `Chambre ${chambre.numero} - ${typeLabel} (${chambre.prixParNuit.toLocaleString('fr-FR')} FCFA/nuit)`;
  }

  /**
   * Détermine la sévérité du tag de paiement selon le montant restant
   * PrimeNG 20 utilise 'warn' et non 'warning'
   */
  getPaymentSeverity(): 'success' | 'warn' | 'danger' {
    if (this.montantRestant === 0) return 'success';
    if (this.montantRestant === this.montantTotal) return 'danger';
    return 'warn';
  }

  /**
   * Retourne le label approprié pour le statut de paiement
   */
  getPaymentLabel(): string {
    if (this.montantRestant === 0) return 'Payé intégralement';
    if (this.montantRestant === this.montantTotal) return 'Non payé';
    return 'Acompte versé';
  }

  /**
   * Retourne le prix formaté de la chambre sélectionnée
   * Gère le cas où selectedChambre pourrait être undefined
   */
  getChambrePrixFormate(): string {
    return this.selectedChambre 
      ? this.selectedChambre.prixParNuit.toLocaleString('fr-FR') + ' FCFA'
      : '0 FCFA';
  }

  /**
   * Vérifie si le formulaire actuel contient des erreurs
   */
  hasErrors(): boolean {
    const form = this.getCurrentForm();
    return form.invalid && form.touched;
  }
}