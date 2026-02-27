import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RestaurantService } from '../../../services/restaurant.service';
import {
  CommandeRestaurant,
  StatutCommandeRestaurant,
  STATUT_COMMANDE_LABELS,
  STATUT_COMMANDE_COLORS
} from '../../../models/restaurant.model';
type Severity = "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined;

@Component({
  selector: 'app-listeresto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './listeresto.html',
  styleUrl: './listeresto.css'
})
export class Listeresto implements OnInit {
  commandes: CommandeRestaurant[] = [];
  commandesFiltrees: CommandeRestaurant[] = [];
  loading: boolean = false;
  searchValue: string = '';
  selectedStatut: string = '';

  // Statistiques
  totalCommandes: number = 0;
  commandesEnAttente: number = 0;
  commandesEnCours: number = 0;
  montantTotal: number = 0;

  // Options de statut
  statutOptions = [
    { label: 'Tous les statuts', value: '' },
    { label: 'En attente', value: StatutCommandeRestaurant.EN_ATTENTE },
    { label: 'En préparation', value: StatutCommandeRestaurant.EN_PREPARATION },
    { label: 'Prête', value: StatutCommandeRestaurant.PRETE },
    { label: 'Servie', value: StatutCommandeRestaurant.SERVIE },
    { label: 'Payée', value: StatutCommandeRestaurant.PAYEE },
    { label: 'Annulée', value: StatutCommandeRestaurant.ANNULEE }
  ];

  constructor(
    private restaurantService: RestaurantService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.loading = true;
    this.restaurantService.getCommandes().subscribe({
      next: (response) => {
        if (response.success) {
          this.commandes = response.data;
          this.commandesFiltrees = this.commandes;
          this.calculerStatistiques();
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les commandes'
        });
        this.loading = false;
      }
    });
  }

  calculerStatistiques(): void {
    this.totalCommandes = this.commandes.length;
    this.commandesEnAttente = this.commandes.filter(
      c => c.statut === StatutCommandeRestaurant.EN_ATTENTE
    ).length;
    this.commandesEnCours = this.commandes.filter(
      c => c.statut === StatutCommandeRestaurant.EN_PREPARATION
    ).length;
    this.montantTotal = this.commandes
      .filter(c => c.statut !== StatutCommandeRestaurant.ANNULEE)
      .reduce((sum, c) => sum + c.montantTotal, 0);
  }

  applyFilters(): void {
    let filtered = [...this.commandes];

    if (this.searchValue.trim()) {
      const search = this.searchValue.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.numeroCommande?.toLowerCase().includes(search) ||
        c.clientNom?.toLowerCase().includes(search) ||
        c.nomClientExterne?.toLowerCase().includes(search) ||
        c.numeroTable?.toLowerCase().includes(search) ||
        c.serveurNom?.toLowerCase().includes(search)
      );
    }

    if (this.selectedStatut) {
      filtered = filtered.filter(c => c.statut === this.selectedStatut);
    }

    this.commandesFiltrees = filtered;
  }

  onSearchChange(): void { this.applyFilters(); }
  onStatutChange(): void { this.applyFilters(); }

  clearFilters(): void {
    this.searchValue = '';
    this.selectedStatut = '';
    this.applyFilters();
  }

  nouvelleCommande(): void {
    this.router.navigate(['/restauration/create']);
  }

  viewCommande(commande: CommandeRestaurant): void {
    this.router.navigate(['/restauration', commande.id]);
  }

  changerStatut(commande: CommandeRestaurant, nouveauStatut: StatutCommandeRestaurant): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment passer cette commande à "${STATUT_COMMANDE_LABELS[nouveauStatut]}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.restaurantService.updateStatut(commande.id!, nouveauStatut).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Statut mis à jour avec succès' });
              this.loadCommandes();
            }
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error?.message || 'Impossible de mettre à jour le statut' });
          }
        });
      }
    });
  }

  marquerCommeServie(commande: CommandeRestaurant): void {
    this.changerStatut(commande, StatutCommandeRestaurant.SERVIE);
  }

  marquerCommePayee(commande: CommandeRestaurant): void {
    this.changerStatut(commande, StatutCommandeRestaurant.PAYEE);
  }

  ajouterPaiement(commande: CommandeRestaurant): void {
    const montantRestant = commande.montantTotal - (commande.montantPaye || 0);
    this.confirmationService.confirm({
      message: `Enregistrer un paiement de ${montantRestant.toLocaleString('fr-FR')} FCFA ?`,
      header: 'Paiement',
      icon: 'pi pi-money-bill',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.restaurantService.addPaiement(commande.id!, montantRestant).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Paiement enregistré avec succès' });
              this.loadCommandes();
            }
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error?.message || 'Impossible d\'enregistrer le paiement' });
          }
        });
      }
    });
  }

  /**
   * Génère et imprime le reçu d'une commande restaurant (100% frontend, sans appel backend)
   */
  imprimerRecu(commande: CommandeRestaurant): void {
    const client = this.getClientDisplay(commande);
    const dateCommande = commande.dateCommande
      ? new Date(commande.dateCommande).toLocaleString('fr-FR')
      : new Date().toLocaleString('fr-FR');
    const montantPaye = commande.montantPaye || 0;
    const montantRestant = this.getMontantRestant(commande);
    const statut = this.getStatutLabel(commande.statut);

    // Lignes de commande
    const lignesHTML = (commande.lignes || []).map(ligne => `
      <tr>
        <td>${ligne.produitNom || 'Produit'}</td>
        <td style="text-align:center">${ligne.quantite}</td>
        <td style="text-align:right">${ligne.prixUnitaire.toLocaleString('fr-FR')} FCFA</td>
        <td style="text-align:right">${(ligne.sousTotal ?? ligne.quantite * ligne.prixUnitaire).toLocaleString('fr-FR')} FCFA</td>
      </tr>
      ${ligne.notes ? `<tr><td colspan="4" style="font-size:11px;color:#666;padding-left:8px;padding-top:0">↳ ${ligne.notes}</td></tr>` : ''}
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Reçu Commande ${commande.numeroCommande || commande.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #111;
      background: #fff;
      padding: 20px;
      max-width: 380px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #333;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .header h1 {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .header p { font-size: 12px; color: #444; margin-top: 2px; }
    .section-title {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 1px;
      margin: 10px 0 4px;
      color: #333;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px 8px;
      font-size: 12px;
      margin-bottom: 10px;
    }
    .info-grid span:first-child { color: #555; }
    .info-grid span:last-child { font-weight: 600; text-align: right; }
    .divider { border-top: 1px dashed #999; margin: 10px 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    thead tr th {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #333;
      padding: 4px 2px;
    }
    thead tr th:last-child,
    thead tr th:nth-child(2),
    thead tr th:nth-child(3) { text-align: right; }
    tbody tr td { padding: 5px 2px; vertical-align: top; }
    .totals {
      margin-top: 10px;
      border-top: 2px solid #333;
      padding-top: 8px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      font-size: 12px;
    }
    .totals-row.total-final {
      font-size: 16px;
      font-weight: 900;
      border-top: 1px dashed #333;
      margin-top: 6px;
      padding-top: 6px;
    }
    .totals-row.restant { color: #c0392b; font-weight: 700; }
    .totals-row.paye { color: #27ae60; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      border: 1px solid currentColor;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 2px dashed #333;
      font-size: 11px;
      color: #555;
    }
    .footer strong { display: block; font-size: 13px; color: #111; margin-bottom: 4px; }
    @media print {
      body { padding: 5px; max-width: 100%; }
      @page { margin: 10mm; size: 80mm auto; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍽 Restaurant</h1>
    <p>REÇU DE COMMANDE</p>
    <p style="margin-top:6px;font-size:13px;font-weight:700">${commande.numeroCommande || '#' + commande.id}</p>
  </div>

  <div class="section-title">Informations</div>
  <div class="info-grid">
    <span>Client</span><span>${client}</span>
    ${commande.numeroTable ? `<span>Table</span><span>${commande.numeroTable}</span>` : ''}
    ${commande.serveurNom ? `<span>Serveur</span><span>${commande.serveurNom}</span>` : ''}
    <span>Date</span><span>${dateCommande}</span>
    <span>Statut</span><span>${statut}</span>
  </div>

  <div class="divider"></div>
  <div class="section-title">Détail de la commande</div>

  <table>
    <thead>
      <tr>
        <th style="text-align:left">Article</th>
        <th style="text-align:center">Qté</th>
        <th style="text-align:right">P.U.</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${lignesHTML}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row total-final">
      <span>TOTAL</span>
      <span>${commande.montantTotal.toLocaleString('fr-FR')} FCFA</span>
    </div>
    <div class="totals-row paye">
      <span>Montant payé</span>
      <span>${montantPaye.toLocaleString('fr-FR')} FCFA</span>
    </div>
    ${montantRestant > 0 ? `
    <div class="totals-row restant">
      <span>Reste à payer</span>
      <span>${montantRestant.toLocaleString('fr-FR')} FCFA</span>
    </div>` : `
    <div class="totals-row paye">
      <span>✓ Entièrement payé</span>
      <span></span>
    </div>`}
  </div>

  <div class="footer">
    <strong>Merci de votre commande !</strong>
    <p>Imprimé le ${new Date().toLocaleString('fr-FR')}</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 1000);
    };
  </script>
</body>
</html>`;

    const fenetre = window.open('', '_blank', 'width=500,height=700');
    if (fenetre) {
      fenetre.document.write(html);
      fenetre.document.close();
    }
  }

  getStatutLabel(statut: StatutCommandeRestaurant): string {
    return STATUT_COMMANDE_LABELS[statut] || statut;
  }

  getStatutSeverity(statut: StatutCommandeRestaurant): Severity {
    return (STATUT_COMMANDE_COLORS[statut] || 'info') as Severity;
  }

  getClientDisplay(commande: CommandeRestaurant): string {
    if (commande.clientNom) return commande.clientNom;
    if (commande.nomClientExterne) return commande.nomClientExterne;
    if (commande.reservationNumero) return `Réservation ${commande.reservationNumero}`;
    return 'Client non spécifié';
  }

  canMarquerServie(commande: CommandeRestaurant): boolean {
    return commande.statut === StatutCommandeRestaurant.PRETE;
  }

  canMarquerPayee(commande: CommandeRestaurant): boolean {
    return commande.statut === StatutCommandeRestaurant.SERVIE;
  }

  canAjouterPaiement(commande: CommandeRestaurant): boolean {
    const montantRestant = commande.montantTotal - (commande.montantPaye || 0);
    return montantRestant > 0 && commande.statut !== StatutCommandeRestaurant.ANNULEE;
  }

  getMontantRestant(commande: CommandeRestaurant): number {
    return commande.montantTotal - (commande.montantPaye || 0);
  }
}
