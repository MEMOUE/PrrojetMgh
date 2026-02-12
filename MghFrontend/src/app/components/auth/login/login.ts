import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  selectedAccountType: 'HOTEL' | 'USER' = 'HOTEL';
  registrationSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur vient de s'inscrire
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.registrationSuccess = true;
        // Pré-remplir l'email si fourni
        if (params['email']) {
          this.loginForm?.patchValue({ email: params['email'] });
        }
      }
    });

    // Vérifier si l'utilisateur est déjà connecté
    if (this.authService.isAuthenticated) {
      this.redirectToDashboard();
    }

    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  setAccountType(type: 'HOTEL' | 'USER'): void {
    this.selectedAccountType = type;
    this.errorMessage = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Réinitialiser les messages
    this.errorMessage = '';
    this.registrationSuccess = false;

    // Vérifier la validité du formulaire
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    const loginData: LoginRequest = {
      email: this.loginForm.value.email.trim().toLowerCase(),
      password: this.loginForm.value.password,
      accountType: this.selectedAccountType
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          // Gérer le "Se souvenir de moi"
          if (this.loginForm.value.rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('userEmail', loginData.email);
          } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('userEmail');
          }

          // Rediriger vers le tableau de bord
          this.redirectToDashboard();
        } else {
          this.errorMessage = response.message || 'Email ou mot de passe incorrect';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur de connexion:', error);

        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.';
        } else {
          this.errorMessage = 'Une erreur s\'est produite lors de la connexion. Veuillez réessayer.';
        }
      }
    });
  }

  private redirectToDashboard(): void {
    const user = this.authService.currentUserValue;

    if (user?.accountType === 'HOTEL') {
      this.router.navigate(['/dashboard']);
    } else if (user?.accountType === 'USER') {
      // Rediriger vers le tableau de bord approprié selon le rôle
      if (user.roles?.includes('RECEPTION')) {
        this.router.navigate(['/dashboard/reception']);
      } else if (user.roles?.includes('RESTAURANT')) {
        this.router.navigate(['/dashboard/restaurant']);
      } else if (user.roles?.includes('MANAGER')) {
        this.router.navigate(['/dashboard/manager']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Méthode pour afficher le message d'erreur approprié
  getFieldErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control?.hasError('email')) {
      return 'Format d\'email invalide';
    }
    return '';
  }
}
