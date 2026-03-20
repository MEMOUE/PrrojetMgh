import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

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

import { ReservationService, ModifierReservationRequest } from '../../../services/reservation.service';
import { ChambreService } from '../../../services/chambre.service';
import { ClientService } from '../../../services/client.service';
import { CreateReservationRequest, Client, StatutReservation } from '../../../models/reservation.model';
import { Chambre, TYPE_CHAMBRE_LABELS } from '../../../models/hotel.model';
import { Client as ClientModel } from '../../../models/client.model';

@Component({
  selector: 'app-creatrservation',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    StepsModule, CardModule, ButtonModule, InputTextModule,
    InputNumberModule, DatePickerModule, SelectModule, TextareaModule,
    RadioButtonModule, DividerModule, ToastModule, ToolbarModule,
    TagModule, ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './creatrservation.html',
  styleUrl: './creatrservation.css'
})
export class Creatrservation implements OnInit {
  readonly TYPE_CHAMBRE_LABELS = TYPE_CHAMBRE_LABELS;
  readonly StatutReservation   = StatutReservation;

  activeIndex = 0;
  loading     = false;
  isEditMode  = false;
  reservationId?: number;

  datesForm!:   FormGroup;
  clientForm!:  FormGroup;
  paiementForm!: FormGroup;

  chambresDisponibles: Chambre[] = [];
  selectedChambre?: Chambre;

  // Infos chambre en mode édition (lecture seule pour la chambre, modifiable pour les dates)
  chambreActuelle?: { id: number; numero: string; type: string; prixParNuit: number };

  clientType: 'nouveau' | 'existant' = 'nouveau';
  clientsExistants: { label: string; value: number; telephone: string }[] = [];
  clientsLoading = false;

  // Statut courant de la résa éditée (détermine quels champs sont bloqués)
  statutEdit?: StatutReservation;

  // Mémorisation des valeurs originales pour calcul de différence
  ancienMontantTotal = 0;
  ancienMontantPaye  = 0;

  typePieceOptions = [
    { label: "Carte d'identité nationale", value: 'CNI'         },
    { label: 'Passeport',                  value: 'PASSEPORT'   },
    { label: 'Permis de conduire',         value: 'PERMIS'      },
    { label: "Attestation d'identité",     value: 'ATTESTATION' },
    { label: 'Autre document',             value: 'AUTRE'       }
  ];

  modePaiementOptions = [
    { label: '💵 Espèces',        value: 'ESPECES'        },
    { label: '💳 Carte bancaire', value: 'CARTE_BANCAIRE' },
    { label: '🏦 Virement',       value: 'VIREMENT'       },
    { label: '📱 Orange Money',   value: 'ORANGE_MONEY'   },
    { label: '📱 MTN Money',      value: 'MTN_MONEY'      },
    { label: '📱 Wave',           value: 'WAVE'           },
    { label: '📱 Moov Money',     value: 'MOOV_MONEY'     }
  ];

  items = [
    { label: 'Dates & Chambre'     },
    { label: 'Informations Client' },
    { label: 'Paiement & Notes'    },
    { label: 'Confirmation'        }
  ];

  minDate:      Date = new Date();
  minDateDepart: Date = new Date();
  nombreNuits  = 0;
  montantTotal = 0;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private chambreService: ChambreService,
    private clientService: ClientService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.checkEditMode();
  }

  // ── Formulaires ───────────────────────────────────────────────────────────

  private initForms(): void {
    this.datesForm = this.fb.group({
      chambreId:     [null, Validators.required],
      dateArrivee:   [null, Validators.required],
      dateDepart:    [null, Validators.required],
      nombreAdultes: [1,   [Validators.required, Validators.min(1), Validators.max(10)]],
      nombreEnfants: [0,   [Validators.min(0), Validators.max(10)]]
    });

    this.clientForm = this.fb.group({
      clientId:      [null],
      prenom:        ['', [Validators.required, Validators.minLength(2)]],
      nom:           ['', [Validators.required, Validators.minLength(2)]],
      telephone:     ['', [Validators.required]],
      email:         ['', [Validators.email]],
      typePiece:     [''], pieceIdentite: [''], dateNaissance: [null],
      nationalite:   [''], adresse: [''], ville: [''],
      pays:          ["Côte d'Ivoire"], notes: ['']
    });

    this.paiementForm = this.fb.group({
      montantPaye:       [0, [Validators.min(0)]],
      modePaiement:      [null],
      demandesSpeciales: [''],
      referenceExterne:  ['']
    });

    // Recalcul automatique quand les dates changent
    this.datesForm.get('dateArrivee')?.valueChanges.subscribe(v => { if (v) this.onDatesChange(); });
    this.datesForm.get('dateDepart')?.valueChanges.subscribe(v  => { if (v) this.onDatesChange(); });

    this.paiementForm.get('montantPaye')?.valueChanges.subscribe(m => {
      const ctrl = this.paiementForm.get('modePaiement');
      if (m > 0) ctrl?.setValidators([Validators.required]);
      else ctrl?.clearValidators();
      ctrl?.updateValueAndValidity();
    });
  }

  // ── Mode édition ──────────────────────────────────────────────────────────

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode    = true;
      this.reservationId = +id;
      this.loadReservation(+id);
    }
  }

  private loadReservation(id: number): void {
    this.loading = true;
    this.reservationService.getReservationById(id).subscribe({
      next: ({ success, data }) => {
        if (success && data) {
          this.statutEdit         = data.statut;
          this.ancienMontantTotal = data.montantTotal ?? 0;
          this.ancienMontantPaye  = data.montantPaye  ?? 0;
          this.nombreNuits        = data.nombreNuits  ?? 0;
          this.montantTotal       = data.montantTotal ?? 0;

          this.chambreActuelle = {
            id:          data.chambreId,
            numero:      data.chambreNumero ?? '',
            type:        '',
            prixParNuit: data.prixParNuit   ?? 0
          };

          const dateArrivee = new Date(data.dateArrivee);
          const dateDepart  = new Date(data.dateDepart);

          // Mettre à jour minDateDepart
          this.minDateDepart = new Date(dateArrivee);
          this.minDateDepart.setDate(this.minDateDepart.getDate() + 1);

          this.datesForm.patchValue({
            chambreId:     data.chambreId,
            dateArrivee,
            dateDepart,
            nombreAdultes: data.nombreAdultes,
            nombreEnfants: data.nombreEnfants ?? 0
          });

          // Bloquer la date d'arrivée si le client est déjà en cours de séjour
          if (data.statut === StatutReservation.EN_COURS) {
            this.datesForm.get('dateArrivee')?.disable();
          }

          // Client
          this.clientType = 'existant';
          this.loadClients(() => this.clientForm.patchValue({ clientId: data.clientId }));
          this.onClientTypeChange('existant');

          // Notes / paiement
          this.paiementForm.patchValue({
            demandesSpeciales: data.demandesSpeciales ?? '',
            referenceExterne:  data.referenceExterne  ?? '',
            montantPaye:       data.montantPaye       ?? 0,
            modePaiement:      data.modePaiement      ?? null
          });
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger la réservation' });
        this.loading = false;
        this.router.navigate(['/reservation']);
      }
    });
  }

  // ── Clients ───────────────────────────────────────────────────────────────

  loadClients(cb?: () => void): void {
    this.clientsLoading = true;
    this.clientService.getClients().subscribe({
      next: r => {
        if (r.success) {
          this.clientsExistants = (r.data as ClientModel[]).map(c => ({
            label: `${c.prenom} ${c.nom} — ${c.telephone}`,
            value: c.id!,
            telephone: c.telephone
          }));
        }
        this.clientsLoading = false;
        cb?.();
      },
      error: () => { this.clientsLoading = false; cb?.(); }
    });
  }

  // ── Dates ─────────────────────────────────────────────────────────────────

  private onDatesChange(): void {
    const a = this.datesForm.get('dateArrivee')?.value as Date;
    const d = this.datesForm.get('dateDepart')?.value  as Date;
    if (!a || !d) return;

    if (d <= a) {
      this.datesForm.get('dateDepart')?.setErrors({ invalidDate: true });
      return;
    }

    // Mise à jour de la minDate pour le champ départ
    this.minDateDepart = new Date(a);
    this.minDateDepart.setDate(this.minDateDepart.getDate() + 1);

    this.nombreNuits = Math.ceil((d.getTime() - a.getTime()) / 86400000);
    this.recalcMontant();

    if (!this.isEditMode) this.loadChambresDisponibles(a, d);
  }

  private recalcMontant(): void {
    const prix = this.isEditMode
      ? (this.chambreActuelle?.prixParNuit ?? 0)
      : (this.selectedChambre?.prixParNuit ?? 0);
    this.montantTotal = prix * this.nombreNuits;
  }

  private loadChambresDisponibles(a: Date, d: Date): void {
    this.loading = true;
    this.chambreService.getChambresDisponibles(this.fmt(a), this.fmt(d)).subscribe({
      next: chambres => { this.chambresDisponibles = chambres; this.loading = false; },
      error: ()      => { this.chambresDisponibles = []; this.loading = false; }
    });
  }

  onChambreSelect(evt: any): void {
    this.selectedChambre = this.chambresDisponibles.find(c => c.id === evt.value);
    this.recalcMontant();
  }

  // ── Calculs financiers ────────────────────────────────────────────────────

  get difference(): number     { return this.montantTotal - this.ancienMontantTotal; }
  get differenceAbs(): number  { return Math.abs(this.difference); }
  get differenceClass(): string {
    if (this.difference > 0) return 'text-orange-600 font-bold';
    if (this.difference < 0) return 'text-green-600 font-bold';
    return 'text-color-secondary';
  }
  get differenceLabel(): string {
    if (this.difference > 0) return `+${this.differenceAbs.toLocaleString('fr-FR')} FCFA (supplément à payer)`;
    if (this.difference < 0) return `-${this.differenceAbs.toLocaleString('fr-FR')} FCFA (remboursement possible)`;
    return 'Aucune différence de montant';
  }

  get montantRestant(): number {
    if (this.isEditMode) return Math.max(0, this.montantTotal - this.ancienMontantPaye);
    return Math.max(0, this.montantTotal - (this.paiementForm.value.montantPaye || 0));
  }
  get formattedMontantTotal():   string { return this.montantTotal.toLocaleString('fr-FR') + ' FCFA'; }
  get formattedAncienTotal():    string { return this.ancienMontantTotal.toLocaleString('fr-FR') + ' FCFA'; }
  get formattedMontantPaye():    string {
    const m = this.isEditMode ? this.ancienMontantPaye : (this.paiementForm.value.montantPaye || 0);
    return m.toLocaleString('fr-FR') + ' FCFA';
  }
  get formattedMontantRestant(): string { return this.montantRestant.toLocaleString('fr-FR') + ' FCFA'; }

  get estEnCours(): boolean { return this.statutEdit === StatutReservation.EN_COURS; }

  // ── Navigation ────────────────────────────────────────────────────────────

  nextStep(): void {
    if (this.activeIndex === 0) {
      const chambreOk = this.isEditMode
        ? !!this.datesForm.get('chambreId')?.value
        : !!this.selectedChambre;
      if (this.datesForm.invalid) {
        this.markTouched(this.datesForm);
        this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Vérifiez les dates et le nombre de voyageurs' });
        return;
      }
      if (!chambreOk) {
        this.messageService.add({ severity: 'warn', summary: 'Chambre requise', detail: 'Veuillez sélectionner une chambre' });
        return;
      }
    }
    if (this.activeIndex === 1 && !this.isEditMode && this.clientForm.invalid) {
      this.markTouched(this.clientForm);
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Complétez les informations client' });
      return;
    }
    if (this.activeIndex < 3) this.activeIndex++;
  }

  prevStep(): void {
    if (this.activeIndex > 0) this.activeIndex--;
  }

  // ── Type client ───────────────────────────────────────────────────────────

  onClientTypeChange(type: 'nouveau' | 'existant'): void {
    this.clientType = type;
    if (type === 'existant') {
      if (!this.clientsExistants.length) this.loadClients();
      Object.keys(this.clientForm.controls).forEach(k => {
        if (k === 'clientId') {
          this.clientForm.get(k)?.setValidators([Validators.required]);
        } else {
          this.clientForm.get(k)?.disable();
          this.clientForm.get(k)?.clearValidators();
        }
        this.clientForm.get(k)?.updateValueAndValidity();
      });
    } else {
      Object.keys(this.clientForm.controls).forEach(k => {
        if (k !== 'clientId') { this.clientForm.get(k)?.enable(); }
        else { this.clientForm.get(k)?.clearValidators(); }
      });
      this.clientForm.get('prenom')?.setValidators([Validators.required, Validators.minLength(2)]);
      this.clientForm.get('nom')?.setValidators([Validators.required, Validators.minLength(2)]);
      this.clientForm.get('telephone')?.setValidators([Validators.required]);
      Object.keys(this.clientForm.controls).forEach(k => this.clientForm.get(k)?.updateValueAndValidity());
    }
  }

  // ── Confirmation ──────────────────────────────────────────────────────────

  confirmerReservation(): void {
    this.isEditMode ? this.saveUpdate() : this.saveCreate();
  }

  private saveCreate(): void {
    if (this.datesForm.invalid || this.clientForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Formulaire invalide', detail: 'Vérifiez les informations' });
      return;
    }
    this.loading = true;
    const req: CreateReservationRequest = {
      chambreId:         this.datesForm.value.chambreId,
      dateArrivee:       this.fmt(this.datesForm.value.dateArrivee),
      dateDepart:        this.fmt(this.datesForm.value.dateDepart),
      nombreAdultes:     this.datesForm.value.nombreAdultes,
      nombreEnfants:     this.datesForm.value.nombreEnfants || 0,
      notes:             this.clientForm.value.notes,
      demandesSpeciales: this.paiementForm.value.demandesSpeciales,
      referenceExterne:  this.paiementForm.value.referenceExterne
    };
    const mp = this.paiementForm.value.montantPaye;
    if (mp > 0) { (req as any).montantPaye = mp; (req as any).modePaiement = this.paiementForm.value.modePaiement; }

    if (this.clientType === 'nouveau') {
      req.newClient = {
        prenom: this.clientForm.value.prenom, nom: this.clientForm.value.nom,
        telephone: this.clientForm.value.telephone,
        email: this.clientForm.value.email || undefined,
        typePiece: this.clientForm.value.typePiece || undefined,
        pieceIdentite: this.clientForm.value.pieceIdentite || undefined,
        dateNaissance: this.clientForm.value.dateNaissance ? this.fmt(this.clientForm.value.dateNaissance) : undefined,
        nationalite: this.clientForm.value.nationalite || undefined,
        adresse: this.clientForm.value.adresse || undefined,
        ville: this.clientForm.value.ville || undefined,
        pays: this.clientForm.value.pays || undefined,
        notes: this.clientForm.value.notes || undefined
      } as Client;
    } else {
      req.clientId = this.clientForm.value.clientId;
    }

    this.reservationService.createReservation(req).subscribe({
      next: r => {
        this.loading = false;
        if (r.success && r.data) {
          this.messageService.add({ severity: 'success', summary: 'Créée !', detail: `N° ${r.data.numeroReservation}` });
          setTimeout(() => this.router.navigate(['/reservation']), 1500);
        }
      },
      error: e => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.message }); }
    });
  }

  private saveUpdate(): void {
    if (!this.reservationId) return;
    this.loading = true;

    // getRawValue() = inclut les contrôles disabled (dateArrivee si EN_COURS)
    const raw = this.datesForm.getRawValue();

    const toDate = (v: any): Date => v instanceof Date ? v : new Date(v);

    const req: ModifierReservationRequest = {
      dateArrivee:       this.fmt(toDate(raw.dateArrivee)),
      dateDepart:        this.fmt(toDate(raw.dateDepart)),
      nombreAdultes:     raw.nombreAdultes,
      nombreEnfants:     raw.nombreEnfants || 0,
      notes:             this.clientForm.getRawValue().notes,
      demandesSpeciales: this.paiementForm.value.demandesSpeciales,
      referenceExterne:  this.paiementForm.value.referenceExterne
    };

    this.reservationService.modifierReservation(this.reservationId, req).subscribe({
      next: r => {
        this.loading = false;
        if (r.success) {
          this.messageService.add({ severity: 'success', summary: 'Modification enregistrée', detail: 'La réservation a été mise à jour' });
          setTimeout(() => this.router.navigate(['/reservation', this.reservationId]), 1500);
        }
      },
      error: e => {
        this.loading = false;
        const msg = e.error?.message || e.message || 'Erreur lors de la modification';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
      }
    });
  }

  annuler(): void {
    if (confirm('Êtes-vous sûr ? Les données non enregistrées seront perdues.')) {
      this.router.navigate(['/reservation']);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private fmt(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  getTypeLabel(type: string): string {
    return this.TYPE_CHAMBRE_LABELS[type as keyof typeof TYPE_CHAMBRE_LABELS] || type;
  }
  getChambreLabel(c: Chambre): string {
    return `Chambre ${c.numero} - ${this.getTypeLabel(c.type)} (${c.prixParNuit.toLocaleString('fr-FR')} FCFA/nuit)`;
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
    if (this.isEditMode && this.chambreActuelle) return this.chambreActuelle.prixParNuit.toLocaleString('fr-FR') + ' FCFA';
    return this.selectedChambre ? this.selectedChambre.prixParNuit.toLocaleString('fr-FR') + ' FCFA' : '0 FCFA';
  }
  private markTouched(fg: FormGroup): void {
    Object.values(fg.controls).forEach(c => { c.markAsTouched(); c.markAsDirty(); });
  }
}
