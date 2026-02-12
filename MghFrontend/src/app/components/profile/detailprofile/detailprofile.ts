import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HotelProfileService, HotelProfile } from '../../../services/hotel-profile.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-detailprofile',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule, 
    ButtonModule, 
    SkeletonModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './detailprofile.html',
  styleUrl: './detailprofile.css'
})
export class Detailprofile implements OnInit {
  profile: HotelProfile | null = null;
  loading = true;
  currentUserId: number | null = null;

  constructor(
    private hotelService: HotelProfileService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de l'utilisateur connecté
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.id) {
      this.currentUserId = currentUser.id;
      this.loadProfile();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Utilisateur non connecté'
      });
      this.router.navigate(['/login']);
    }
  }

  loadProfile(): void {
    this.loading = true;
    this.hotelService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.profile = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message || 'Erreur lors du chargement du profil'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger le profil'
        });
        this.loading = false;
      }
    });
  }

  navigateToEdit(): void {
    this.router.navigate(['/profile/edit']);
  }

  navigateToChangePassword(): void {
    this.router.navigate(['/profile/change-password']);
  }

  getStatusSeverity(): 'success' | 'danger' {
    return this.profile?.active ? 'success' : 'danger';
  }

  getStatusLabel(): string {
    return this.profile?.active ? 'Actif' : 'Inactif';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isSubscriptionExpiringSoon(): boolean {
    if (!this.profile?.subscriptionEnd) return false;
    const endDate = new Date(this.profile.subscriptionEnd);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }

  isSubscriptionExpired(): boolean {
    if (!this.profile?.subscriptionEnd) return false;
    return new Date(this.profile.subscriptionEnd) < new Date();
  }

  getDaysUntilExpiry(): number {
    if (!this.profile?.subscriptionEnd) return 0;
    const endDate = new Date(this.profile.subscriptionEnd);
    const today = new Date();
    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
}