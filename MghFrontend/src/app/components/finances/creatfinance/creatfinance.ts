import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';

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
  ModePaiement,
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
    AutoCompleteModule
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

  // Enums pour le template
  TypeTransaction = TypeTransaction;
  StatutTransaction = StatutTransaction;

  // Options pour les selects
  typesTransaction = [
    { label: 'Revenu', value: TypeTransaction.REVENU },
    { label: 'Dépense', value: TypeTransaction.DEPENSE }
  ];

  categoriesOptions: any[] = [];

  modesPaiement = Object.keys(ModePaiement).map(key => ({
    label: MODE_PAIEMENT_LABELS[key as ModePaiement],
    value: key
  }));

  // Autocomplete suggestions
  reservationsSuggestions: any[] = [];
  commandesSuggestions: any[] = [];

  // Upload
  uploadedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService,
    private reservationService: ReservationService,
    private restaurantService: RestaurantService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.transactionId = +params['id'];
        this.loadTransaction();
      }
    });

    // Charger les catégories par défaut
    this.updateCategories(TypeTransaction.REVENU);
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      type: [TypeTransaction.REVENU, Validators.required],
      categorie: ['', Validators.required],
      montant: [null, [Validators.required, Validators.min(0)]],
      dateTransaction: [new Date(), Validators.required],
      description: [''],
      modePaiement: [null],
      
      // Relations (optionnelles)
      reservationId: [null],
      commandeRestaurantId: [null],
      
      // Pièce justificative
      numeroPiece: [''],
      
      // Notes
      notes: ['']
    });

    // Écouter les changements de type pour mettre à jour les catégories
    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      this.updateCategories(type);
    });
  }

  loadTransaction(): void {
    if (!this.transactionId) return;

    this.loading = true;
    this.financeService.getTransactionById(this.transactionId).subscribe({
      next: (response) => {
        if (response.success) {
          const transaction = response.data;
          
          this.transactionForm.patchValue({
            type: transaction.type,
            categorie: transaction.categorie,
            montant: transaction.montant,
            dateTransaction: new Date(transaction.dateTransaction),
            description: transaction.description,
            modePaiement: transaction.modePaiement,
            reservationId: transaction.reservationId,
            commandeRestaurantId: transaction.commandeRestaurantId,
            numeroPiece: transaction.numeroPiece,
            notes: transaction.notes
          });

          this.updateCategories(transaction.type);
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger la transaction'
        });
        this.loading = false;
        this.router.navigate(['/finances']);
      }
    });
  }

  updateCategories(type: TypeTransaction): void {
    if (type === TypeTransaction.REVENU) {
      this.categoriesOptions = CATEGORIES_REVENUS.map(cat => ({
        label: cat.nom,
        value: cat.nom
      }));
    } else {
      this.categoriesOptions = CATEGORIES_DEPENSES.map(cat => ({
        label: cat.nom,
        value: cat.nom
      }));
    }
  }

  searchReservations(event: any): void {
    const query = event.query.toLowerCase();
    
    this.reservationService.searchReservations(query).subscribe({
      next: (response) => {
        if (response.success) {
          this.reservationsSuggestions = response.data.map(r => ({
            label: `${r.numeroReservation} - ${r.clientNom} ${r.clientPrenom}`,
            value: r.id
          }));
        }
      },
      error: (error) => {
        console.error('Erreur lors de la recherche de réservations', error);
      }
    });
  }

  searchCommandes(event: any): void {
    const query = event.query.toLowerCase();
    
    this.restaurantService.getCommandes().subscribe({
      next: (response) => {
        if (response.success) {
          this.commandesSuggestions = response.data
            .filter(c => c.numeroCommande?.toLowerCase().includes(query))
            .map(c => ({
              label: `${c.numeroCommande} - Table ${c.numeroTable || 'N/A'}`,
              value: c.id
            }));
        }
      },
      error: (error) => {
        console.error('Erreur lors de la recherche de commandes', error);
      }
    });
  }

  onFileSelect(event: any): void {
    if (event.files && event.files.length > 0) {
      this.uploadedFile = event.files[0];
    }
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      Object.keys(this.transactionForm.controls).forEach(key => {
        const control = this.transactionForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    this.loading = true;
    const formValue = this.transactionForm.value;

    // Préparer l'objet Transaction
    const transaction: Transaction = {
      type: formValue.type,
      categorie: formValue.categorie,
      montant: formValue.montant,
      dateTransaction: this.formatDate(formValue.dateTransaction),
      description: formValue.description,
      modePaiement: formValue.modePaiement,
      reservationId: formValue.reservationId,
      commandeRestaurantId: formValue.commandeRestaurantId,
      numeroPiece: formValue.numeroPiece,
      notes: formValue.notes,
      statut: StatutTransaction.EN_ATTENTE
    };

    // Créer ou mettre à jour
    const operation = this.isEditMode && this.transactionId
      ? this.financeService.updateTransaction(this.transactionId, transaction)
      : this.financeService.createTransaction(transaction);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: this.isEditMode 
              ? 'Transaction mise à jour avec succès' 
              : 'Transaction créée avec succès'
          });

          // Rediriger vers la liste après un court délai
          setTimeout(() => {
            this.router.navigate(['/finances']);
          }, 1500);
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.isEditMode
            ? 'Impossible de mettre à jour la transaction'
            : 'Impossible de créer la transaction'
        });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/finances']);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get type() { return this.transactionForm.get('type'); }
  get categorie() { return this.transactionForm.get('categorie'); }
  get montant() { return this.transactionForm.get('montant'); }
  get dateTransaction() { return this.transactionForm.get('dateTransaction'); }
  get description() { return this.transactionForm.get('description'); }
  get modePaiement() { return this.transactionForm.get('modePaiement'); }
  get reservationId() { return this.transactionForm.get('reservationId'); }
  get commandeRestaurantId() { return this.transactionForm.get('commandeRestaurantId'); }
  get numeroPiece() { return this.transactionForm.get('numeroPiece'); }
  get notes() { return this.transactionForm.get('notes'); }
}