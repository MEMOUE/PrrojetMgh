import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';

// Services et modèles
import { ChambreService, Chambre } from '../../../services/chambre.service';
import {
  TypeChambre,
  StatutChambre,
  TYPE_CHAMBRE_LABELS,
  STATUT_CHAMBRE_LABELS
} from '../../../models/hotel.model';

@Component({
  selector: 'app-form-chambre',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    CheckboxModule,
    ToastModule,
    InputNumberModule
  ],
  providers: [MessageService],
  templateUrl: './form-chambre.html'
})
export class FormChambre implements OnInit, OnDestroy {
  chambreForm!: FormGroup;
  isEditMode = false;
  loading = false;
  submitting = false;
  errorMessage = '';
  chambreId: number | null = null;

  // Options pour les dropdowns
  typesChambres: any[] = [];
  statuts: any[] = [];
  etages: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private chambreService: ChambreService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private messageService: MessageService
  ) {
    console.log('🏗️ FormChambre constructor appelé');
  }

  ngOnInit(): void {
    console.log('🚀 FormChambre ngOnInit appelé');
    this.initializeOptions();
    this.initializeForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeOptions(): void {
    console.log('🔧 Initialisation des options...');
    
    // Types de chambres
    this.typesChambres = Object.entries(TYPE_CHAMBRE_LABELS).map(([value, label]) => ({
      label,
      value
    }));

    // Statuts
    this.statuts = Object.entries(STATUT_CHAMBRE_LABELS).map(([value, label]) => ({
      label,
      value
    }));

    // Étages
    this.etages = Array.from({ length: 11 }, (_, i) => ({
      label: i === 0 ? 'Rez-de-chaussée' : `Étage ${i}`,
      value: i
    }));
    
    console.log('✅ Options initialisées');
  }

  private initializeForm(): void {
    console.log('📝 Initialisation du formulaire...');
    
    this.chambreForm = this.formBuilder.group({
      // ❌ PLUS DE hotelId - le backend le récupère du JWT
      numero: ['', [Validators.required, Validators.minLength(1)]],
      type: [TypeChambre.SIMPLE, Validators.required],
      etage: [0, Validators.required],
      capacite: [1, [Validators.required, Validators.min(1)]],
      superficie: [null, [Validators.required, Validators.min(1)]],
      prixParNuit: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      statut: [StatutChambre.DISPONIBLE, Validators.required],
      
      // Équipements (noms exacts du backend)
      wifi: [true],
      climatisation: [true],
      television: [true],
      minibar: [false],
      coffre: [false],
      balcon: [false],
      vueMer: [false]
    });
    
    console.log('✅ Formulaire initialisé sans hotelId');
  }

  private checkEditMode(): void {
    console.log('🔍 Vérification du mode édition...');
    
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      console.log('📋 Paramètre id:', id);
      
      if (id) {
        this.isEditMode = true;
        this.chambreId = +id;
        console.log('✏️ Mode édition activé pour chambre ID:', this.chambreId);
        this.loadChambre(this.chambreId);
      } else {
        console.log('➕ Mode création activé');
      }
    });
  }

  private loadChambre(id: number): void {
    console.log('📥 Chargement de la chambre ID:', id);
    this.loading = true;
    this.errorMessage = '';

    this.chambreService.getChambre(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chambre) => {
          console.log('✅ Chambre chargée:', chambre);
          this.populateForm(chambre);
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement:', error);
          this.errorMessage = 'Impossible de charger la chambre';
          this.showError('Erreur', this.errorMessage);
          this.loading = false;
        }
      });
  }

  private populateForm(chambre: Chambre): void {
    console.log('📝 Remplissage du formulaire avec:', chambre);
    
    this.chambreForm.patchValue({
      numero: chambre.numero,
      type: chambre.type,
      etage: chambre.etage,
      capacite: chambre.capacite,
      superficie: chambre.superficie,
      prixParNuit: chambre.prixParNuit,
      description: chambre.description,
      statut: chambre.statut,
      wifi: chambre.wifi ?? true,
      climatisation: chambre.climatisation ?? true,
      television: chambre.television ?? true,
      minibar: chambre.minibar ?? false,
      coffre: chambre.coffre ?? false,
      balcon: chambre.balcon ?? false,
      vueMer: chambre.vueMer ?? false
    });
  }

  onSubmit(): void {
    console.log('📤 Soumission du formulaire...');
    
    if (this.chambreForm.invalid) {
      console.warn('⚠️ Formulaire invalide');
      this.markFormGroupTouched(this.chambreForm);
      this.showError('Formulaire invalide', 'Veuillez corriger les erreurs');
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const formValue = this.chambreForm.value;
    
    // ✅ Créer l'objet chambre SANS hotelId
    const chambreData: Chambre = {
      numero: formValue.numero,
      type: formValue.type,
      etage: formValue.etage,
      capacite: formValue.capacite,
      superficie: formValue.superficie,
      prixParNuit: formValue.prixParNuit,
      description: formValue.description,
      statut: formValue.statut,
      wifi: formValue.wifi,
      climatisation: formValue.climatisation,
      television: formValue.television,
      minibar: formValue.minibar,
      coffre: formValue.coffre,
      balcon: formValue.balcon,
      vueMer: formValue.vueMer
    };

    console.log('📦 Données à envoyer (SANS hotelId):', chambreData);

    const request$ = this.isEditMode
      ? this.chambreService.updateChambre(this.chambreId!, chambreData)
      : this.chambreService.createChambre(chambreData);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (chambre) => {
        const message = this.isEditMode
          ? 'Chambre modifiée avec succès'
          : 'Chambre créée avec succès';

        console.log('✅ Succès:', message, chambre);
        console.log('✅ HotelId automatiquement ajouté par le backend:', chambre.hotelId);
        
        this.showSuccess('Succès', message);
        this.submitting = false;

        setTimeout(() => {
          this.router.navigate(['/chambres']);
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        this.errorMessage = error.message || 'Une erreur est survenue';
        this.showError('Erreur de sauvegarde', this.errorMessage);
        this.submitting = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.chambreForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.chambreForm.get(fieldName);

    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Ce champ est obligatoire';
    if (control.errors['min']) return `La valeur minimale est ${control.errors['min'].min}`;
    if (control.errors['max']) return `La valeur maximale est ${control.errors['max'].max}`;

    return 'Valeur invalide';
  }

  goBack(): void {
    console.log('⬅️ Retour à la page précédente');
    this.location.back();
  }

  private showSuccess(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000
    });
  }

  private showError(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000
    });
  }
}