import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';

import { RestaurantService } from '../../../services/restaurant.service';
import { ReservationService } from '../../../services/reservation.service';
import { 
  CommandeRestaurant, 
  ProduitMenu, 
  LigneCommande,
  CATEGORIES_MENU 
} from '../../../models/restaurant.model ';
import { Reservation } from '../../../models/reservation.model ';

@Component({
  selector: 'app-createresto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    ToastModule,
    TableModule
  ],
  providers: [MessageService],
  templateUrl: './createresto.html',
  styleUrl: './createresto.css'
})
export class Createresto implements OnInit {
  commandeForm!: FormGroup;
  produitsMenu: ProduitMenu[] = [];
  reservations: Reservation[] = [];
  loading: boolean = false;
  isEditMode: boolean = false;
  commandeId?: number;
  
  produitsParCategorie: Map<string, ProduitMenu[]> = new Map();
  categories = CATEGORIES_MENU;

  // Options de type client
  typeClientOptions = [
    { label: 'Client externe', value: 'externe' },
    { label: 'Réservation', value: 'reservation' }
  ];

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private reservationService: ReservationService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProduitsMenu();
    this.loadReservations();

    // Vérifier si mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.commandeId = +params['id'];
        this.loadCommande(this.commandeId);
      }
    });
  }

  initForm(): void {
    this.commandeForm = this.fb.group({
      typeClient: ['externe', Validators.required],
      
      // Client externe
      nomClientExterne: [''],
      telephoneClientExterne: [''],
      
      // Réservation
      reservationId: [null],
      
      numeroTable: [''],
      notes: [''],
      
      // Lignes de commande
      lignes: this.fb.array([])
    });

    // Gérer le changement de type client
    this.commandeForm.get('typeClient')?.valueChanges.subscribe(type => {
      this.updateValidators(type);
    });
  }

  updateValidators(typeClient: string): void {
    const nomControl = this.commandeForm.get('nomClientExterne');
    const telControl = this.commandeForm.get('telephoneClientExterne');
    const reservationControl = this.commandeForm.get('reservationId');

    // Réinitialiser les validateurs
    nomControl?.clearValidators();
    telControl?.clearValidators();
    reservationControl?.clearValidators();

    if (typeClient === 'externe') {
      nomControl?.setValidators([Validators.required]);
      telControl?.setValidators([Validators.required]);
    } else if (typeClient === 'reservation') {
      reservationControl?.setValidators([Validators.required]);
    }

    nomControl?.updateValueAndValidity();
    telControl?.updateValueAndValidity();
    reservationControl?.updateValueAndValidity();
  }

  get lignes(): FormArray {
    return this.commandeForm.get('lignes') as FormArray;
  }

  loadProduitsMenu(): void {
    this.restaurantService.getProduitsDisponibles().subscribe({
      next: (response) => {
        if (response.success) {
          this.produitsMenu = response.data;
          this.organiserParCategorie();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les produits du menu'
        });
      }
    });
  }

  organiserParCategorie(): void {
    this.produitsParCategorie.clear();
    this.produitsMenu.forEach(produit => {
      if (!this.produitsParCategorie.has(produit.categorie)) {
        this.produitsParCategorie.set(produit.categorie, []);
      }
      this.produitsParCategorie.get(produit.categorie)!.push(produit);
    });
  }

  loadReservations(): void {
    this.reservationService.getReservationsEnCours().subscribe({
      next: (response) => {
        if (response.success) {
          this.reservations = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
      }
    });
  }

  loadCommande(id: number): void {
    this.loading = true;
    this.restaurantService.getCommandeById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.patchFormWithCommande(response.data);
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
      }
    });
  }

  patchFormWithCommande(commande: CommandeRestaurant): void {
    // Déterminer le type de client
    let typeClient = 'externe';
    if (commande.reservationId) {
      typeClient = 'reservation';
    }

    this.commandeForm.patchValue({
      typeClient: typeClient,
      nomClientExterne: commande.nomClientExterne,
      telephoneClientExterne: commande.telephoneClientExterne,
      reservationId: commande.reservationId,
      numeroTable: commande.numeroTable,
      notes: commande.notes
    });

    // Ajouter les lignes
    commande.lignes.forEach(ligne => {
      this.ajouterLigneExistante(ligne);
    });
  }

  ajouterLigneExistante(ligne: LigneCommande): void {
    const ligneGroup = this.fb.group({
      produitMenuId: [ligne.produitMenuId, Validators.required],
      quantite: [ligne.quantite, [Validators.required, Validators.min(1)]],
      prixUnitaire: [ligne.prixUnitaire],
      sousTotal: [ligne.sousTotal],
      notes: [ligne.notes]
    });

    this.lignes.push(ligneGroup);
  }

  ajouterProduit(produit: ProduitMenu): void {
    const ligneGroup = this.fb.group({
      produitMenuId: [produit.id, Validators.required],
      produitMenuNom: [produit.nom],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [produit.prix],
      sousTotal: [produit.prix],
      notes: ['']
    });

    // Observer les changements de quantité
    ligneGroup.get('quantite')?.valueChanges.subscribe(() => {
      this.calculerSousTotal(ligneGroup);
    });

    this.lignes.push(ligneGroup);
    this.calculerMontantTotal();
  }

  supprimerLigne(index: number): void {
    this.lignes.removeAt(index);
    this.calculerMontantTotal();
  }

  calculerSousTotal(ligneGroup: FormGroup): void {
    const quantite = ligneGroup.get('quantite')?.value || 0;
    const prixUnitaire = ligneGroup.get('prixUnitaire')?.value || 0;
    const sousTotal = quantite * prixUnitaire;
    ligneGroup.patchValue({ sousTotal }, { emitEvent: false });
    this.calculerMontantTotal();
  }

  calculerMontantTotal(): number {
    return this.lignes.controls.reduce((total, control) => {
      return total + (control.get('sousTotal')?.value || 0);
    }, 0);
  }

  getNomProduit(produitId: number): string {
    const produit = this.produitsMenu.find(p => p.id === produitId);
    return produit?.nom || '';
  }

  onSubmit(): void {
    if (this.commandeForm.invalid) {
      this.markFormGroupTouched(this.commandeForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    if (this.lignes.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez ajouter au moins un produit'
      });
      return;
    }

    const formValue = this.commandeForm.value;
    
    const commande: CommandeRestaurant = {
      statut: 'EN_ATTENTE' as any,
      montantTotal: this.calculerMontantTotal(),
      lignes: this.lignes.value.map((ligne: any) => ({
        produitMenuId: ligne.produitMenuId,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        sousTotal: ligne.sousTotal,
        notes: ligne.notes
      }))
    };

    // Ajouter les informations du client
    if (formValue.typeClient === 'externe') {
      commande.nomClientExterne = formValue.nomClientExterne;
      commande.telephoneClientExterne = formValue.telephoneClientExterne;
    } else if (formValue.typeClient === 'reservation') {
      commande.reservationId = formValue.reservationId;
    }

    if (formValue.numeroTable) {
      commande.numeroTable = formValue.numeroTable;
    }

    if (formValue.notes) {
      commande.notes = formValue.notes;
    }

    this.loading = true;

    const request = this.isEditMode
      ? this.restaurantService.updateStatut(this.commandeId!, commande.statut)
      : this.restaurantService.createCommande(commande);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: this.isEditMode 
              ? 'Commande modifiée avec succès' 
              : 'Commande créée avec succès'
          });
          setTimeout(() => {
            this.router.navigate(['/restauration']);
          }, 1500);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Impossible de sauvegarder la commande'
        });
        this.loading = false;
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/restauration']);
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.commandeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getProduitsCategorie(categorie: string): ProduitMenu[] {
    return this.produitsParCategorie.get(categorie) || [];
  }
}