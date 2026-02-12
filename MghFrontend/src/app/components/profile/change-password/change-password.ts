import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HotelProfileService, UpdatePasswordRequest } from '../../../services/hotel-profile.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    RouterLink
],
  providers: [MessageService],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword implements OnInit {
  passwordForm!: FormGroup;
  submitting = false;
  currentUserId: number | null = null;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelProfileService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Récupérer l'ID de l'utilisateur connecté
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.id) {
      this.currentUserId = currentUser.id;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Utilisateur non connecté'
      });
      this.router.navigate(['/login']);
    }
  }

  initForm(): void {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(100),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validateur personnalisé pour vérifier la force du mot de passe
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);

    const valid = hasNumber && hasUpper && hasLower;

    if (!valid) {
      return { 
        passwordStrength: {
          hasNumber,
          hasUpper,
          hasLower
        }
      };
    }

    return null;
  }

  // Validateur pour vérifier que les mots de passe correspondent
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulaire invalide',
        detail: 'Veuillez corriger les erreurs dans le formulaire'
      });
      return;
    }

    if (!this.currentUserId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID utilisateur non trouvé'
      });
      return;
    }

    this.submitting = true;
    const request: UpdatePasswordRequest = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.hotelService.changePassword(this.currentUserId, request).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Mot de passe modifié avec succès'
          });

          // Réinitialiser le formulaire
          this.passwordForm.reset();

          // Rediriger vers la page de profil après 2 secondes
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 2000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message || 'Erreur lors du changement de mot de passe'
          });
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erreur lors du changement de mot de passe:', error);
        let errorMessage = 'Impossible de changer le mot de passe';
        
        if (error.message && error.message.includes('incorrect')) {
          errorMessage = 'Ancien mot de passe incorrect';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: errorMessage
        });
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }

  // Méthode utilitaire pour marquer tous les champs comme touchés
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helpers pour la validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est obligatoire';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
      if (field.errors['passwordStrength']) {
        return 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
      }
    }

    // Vérifier l'erreur de correspondance au niveau du formulaire
    if (fieldName === 'confirmPassword' && this.passwordForm.errors?.['passwordMismatch']) {
      return 'Les mots de passe ne correspondent pas';
    }

    return '';
  }

  getPasswordStrength(): string {
    const newPassword = this.passwordForm.get('newPassword');
    if (!newPassword || !newPassword.value) {
      return '';
    }

    const value = newPassword.value;
    let strength = 0;

    if (value.length >= 8) strength++;
    if (/[a-z]/.test(value)) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[^a-zA-Z0-9]/.test(value)) strength++;

    if (strength <= 2) return 'Faible';
    if (strength <= 3) return 'Moyen';
    if (strength <= 4) return 'Fort';
    return 'Très fort';
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'Faible': return 'weak';
      case 'Moyen': return 'medium';
      case 'Fort': return 'strong';
      case 'Très fort': return 'very-strong';
      default: return '';
    }
  }
}