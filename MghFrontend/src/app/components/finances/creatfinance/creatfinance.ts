import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TextareaModule } from 'primeng/textarea';

// Services
import { FinanceService } from '../../../services/finance.service';
import { ReservationService } from '../../../services/reservation.service';
import { RestaurantService } from '../../../services/restaurant.service';
import { MessageService } from 'primeng/api';

// Models
import {
  Transaction,
  TypeTransaction,
  StatutTransaction,
  ModePaiementTransaction,
  CATEGORIES_REVENUS,
  CATEGORIES_DEPENSES,
  MODE_PAIEMENT_LABELS
} from '../../../models/finance.model';

@Component({
  selector: 'app-creatfinance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    ToastModule,
    FileUploadModule,
    AutoCompleteModule,
    TextareaModule
  ],
  templateUrl: './creatfinance.html',
  styleUrl: './creatfinance.css',
  providers: [MessageService]
})
export class Creatfinance implements OnInit {
  transactionForm!: FormGroup;
  loading = false;
  isEditMode = false;
  transactionId: number | null = null;

  // Expose enums au template
  TypeTransaction = TypeTransaction;
  StatutTransaction = StatutTransaction;

  typesTransaction = [
    { label: 'Revenu', value: TypeTransaction.REVENU },
    { label: 'Dépense', value: TypeTransaction.DEPENSE }
  ];

  categoriesOptions: { label: string; value: string }[] = [];

  modesPaiement = Object.keys(ModePaiementTransaction).map(key => ({
    label: MODE_PAIEMENT_LABELS[key as ModePaiementTransaction],
    value: key
  }));

  reservationsSuggestions: { label: string; value: number }[] = [];
  commandesSuggestions: { label: string; value: number }[] = [];
  uploadedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService,
    private reservationService: ReservationService,
    private restaurantService: RestaurantService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.updateCategories(TypeTransaction.REVENU);

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.transactionId = +params['id'];
        this.loadTransaction();
      }
    });

    // Recharger catégories quand le type change
    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      this.transactionForm.get('categorie')?.setValue('');
      this.updateCategories(type);
    });
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      type: [TypeTransaction.REVENU, Validators.required],
      categorie: ['', Validators.required],
      montant: [null, [Validators.required, Validators.min(1)]],
      dateTransaction: [new Date(), Validators.required],
      description: [''],
      modePaiement: [null],
      reservationId: [null],
      commandeRestaurantId: [null],
      numeroPiece: [''],
      notes: ['']
    });
  }

  loadTransaction(): void {
    if (!this.transactionId) return;
    this.loading = true;
    this.financeService.getTransactionById(this.transactionId).subscribe({
      next: (response) => {
        if (response.success) {
          const t = response.data;
          this.updateCategories(t.type);
          this.transactionForm.patchValue({
            type: t.type,
            categorie: t.categorie,
            montant: t.montant,
            dateTransaction: t.dateTransaction ? new Date(t.dateTransaction) : new Date(),
            description: t.description,
            modePaiement: t.modePaiement,
            reservationId: t.reservationId,
            commandeRestaurantId: t.commandeRestaurantId,
            numeroPiece: t.numeroPiece,
            notes: t.notes
          });
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger la transaction' });
        this.loading = false;
        this.router.navigate(['/finances']);
      }
    });
  }

  updateCategories(type: TypeTransaction): void {
    const list = type === TypeTransaction.REVENU ? CATEGORIES_REVENUS : CATEGORIES_DEPENSES;
    this.categoriesOptions = list.map(c => ({ label: c.nom, value: c.nom }));
  }

  searchReservations(event: { query: string }): void {
    this.reservationService.searchReservations(event.query).subscribe({
      next: (response) => {
        if (response.success) {
          this.reservationsSuggestions = response.data.map(r => ({
            label: `${r.numeroReservation} – ${r.clientNom ?? ''} ${r.clientPrenom ?? ''}`.trim(),
            value: r.id!
          }));
        }
      },
      error: () => {}
    });
  }

  searchCommandes(event: { query: string }): void {
    const query = event.query.toLowerCase();
    this.restaurantService.getCommandes().subscribe({
      next: (response) => {
        if (response.success) {
          this.commandesSuggestions = response.data
            .filter(c => c.numeroCommande?.toLowerCase().includes(query))
            .map(c => ({
              label: `${c.numeroCommande} – Table ${c.numeroTable ?? 'N/A'}`,
              value: c.id!
            }));
        }
      },
      error: () => {}
    });
  }

  onFileSelect(event: { files: File[] }): void {
    if (event.files?.length) this.uploadedFile = event.files[0];
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      Object.values(this.transactionForm.controls).forEach(c => c.markAsTouched());
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir les champs obligatoires' });
      return;
    }

    this.loading = true;
    const fv = this.transactionForm.value;

    // Extraire l'ID si l'autocomplete a retourné un objet
    const reservationId = fv.reservationId?.value ?? fv.reservationId ?? null;
    const commandeId = fv.commandeRestaurantId?.value ?? fv.commandeRestaurantId ?? null;

    const transaction: Transaction = {
      type: fv.type,
      categorie: fv.categorie,
      montant: fv.montant,
      dateTransaction: this.formatDateISO(fv.dateTransaction),
      description: fv.description,
      modePaiement: fv.modePaiement,
      reservationId,
      commandeRestaurantId: commandeId,
      numeroPiece: fv.numeroPiece,
      notes: fv.notes,
      statut: StatutTransaction.EN_ATTENTE
    };

    const op$ = this.isEditMode && this.transactionId
      ? this.financeService.updateTransaction(this.transactionId, transaction)
      : this.financeService.createTransaction(transaction);

    op$.subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: this.isEditMode ? 'Transaction mise à jour' : 'Transaction créée'
          });
          setTimeout(() => this.router.navigate(['/finances']), 1500);
        }
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err?.error?.message ?? 'Une erreur est survenue' });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/finances']);
  }

  private formatDateISO(date: Date): string {
    const d = new Date(date);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // Getters pour le template
  get type() { return this.transactionForm.get('type'); }
  get categorie() { return this.transactionForm.get('categorie'); }
  get montant() { return this.transactionForm.get('montant'); }
  get dateTransaction() { return this.transactionForm.get('dateTransaction'); }
  get modePaiement() { return this.transactionForm.get('modePaiement'); }
}
