import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ReservationService } from '../../services/reservation.service';
import { ChambreService, Chambre } from '../../services/chambre.service';
import { Reservation, StatutReservation, ModePaiement } from '../../models/reservation.model';

interface CellInfo {
  reservation: Reservation | null;
  isStart: boolean;
  isEnd: boolean;
  colspan: number;
}

@Component({
  selector: 'app-planning',
  imports: [CommonModule, FormsModule],
  templateUrl: './planning.html',
  styleUrl: './planning.css',
})
export class Planning implements OnInit {
  chambres: Chambre[] = [];
  reservations: Reservation[] = [];
  dates: Date[] = [];

  // grid[chambreId][dateKey] = reservation | null
  grid: Map<number, Map<string, Reservation>> = new Map();

  selectedReservation: Reservation | null = null;
  showModal = false;
  loading = true;
  error = '';

  // Date range
  startDate: Date = new Date();
  endDate: Date = new Date();
  daysCount = 30;

  // Paiement form
  showPaiementForm = false;
  paiementMontant = 0;
  paiementMode = 'ESPECES';

  modesPaiement = [
    { value: 'ESPECES', label: 'Espèces' },
    { value: 'CARTE_BANCAIRE', label: 'Carte bancaire' },
    { value: 'ORANGE_MONEY', label: 'Orange Money' },
    { value: 'MTN_MONEY', label: 'MTN Money' },
    { value: 'WAVE', label: 'Wave' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
    { value: 'VIREMENT', label: 'Virement' },
  ];

  statutConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    EN_ATTENTE: { label: 'En attente', color: '#92400e', bg: '#fef3c7', border: '#f59e0b' },
    CONFIRMEE:  { label: 'Confirmée',  color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' },
    EN_COURS:   { label: 'En cours',   color: '#065f46', bg: '#d1fae5', border: '#10b981' },
    TERMINEE:   { label: 'Terminée',   color: '#374151', bg: '#f3f4f6', border: '#9ca3af' },
    ANNULEE:    { label: 'Annulée',    color: '#991b1b', bg: '#fee2e2', border: '#ef4444' },
    NO_SHOW:    { label: 'No-show',    color: '#7c2d12', bg: '#ffedd5', border: '#f97316' },
  };

  constructor(
    private reservationService: ReservationService,
    private chambreService: ChambreService
  ) {
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 3);
    this.endDate = new Date(this.startDate);
    this.endDate.setDate(this.endDate.getDate() + this.daysCount);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      chambres: this.chambreService.getChambres(),
      reservationsResp: this.reservationService.getAllReservations(),
    }).subscribe({
      next: ({ chambres, reservationsResp }) => {
        this.chambres = (chambres || []).sort((a, b) =>
          (a.numero || '').localeCompare(b.numero || '', undefined, { numeric: true })
        );
        const raw = (reservationsResp as any)?.data ?? reservationsResp;
        this.reservations = Array.isArray(raw) ? raw : [];
        this.buildDates();
        this.buildGrid();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Erreur lors du chargement des données';
        this.loading = false;
      },
    });
  }

  buildDates(): void {
    this.dates = [];
    const cur = new Date(this.startDate);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(this.endDate);
    end.setHours(0, 0, 0, 0);
    while (cur <= end) {
      this.dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }

  buildGrid(): void {
    this.grid = new Map();
    for (const c of this.chambres) {
      this.grid.set(c.id!, new Map());
    }
    for (const res of this.reservations) {
      const map = this.grid.get(res.chambreId);
      if (!map) continue;
      const arr = new Date(res.dateArrivee);
      const dep = new Date(res.dateDepart);
      arr.setHours(0, 0, 0, 0);
      dep.setHours(0, 0, 0, 0);
      const cur = new Date(arr);
      while (cur < dep) {
        map.set(this.dk(cur), res);
        cur.setDate(cur.getDate() + 1);
      }
    }
  }

  dk(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  getRes(chambreId: number, date: Date): Reservation | null {
    return this.grid.get(chambreId)?.get(this.dk(date)) ?? null;
  }

  isStartDate(chambreId: number, date: Date): boolean {
    const res = this.getRes(chambreId, date);
    if (!res) return false;
    const arr = new Date(res.dateArrivee);
    arr.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return arr.getTime() === d.getTime();
  }

  isEndDate(chambreId: number, date: Date): boolean {
    const res = this.getRes(chambreId, date);
    if (!res) return false;
    const dep = new Date(res.dateDepart);
    dep.setHours(0, 0, 0, 0);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return dep.getTime() === next.getTime();
  }

  isToday(date: Date): boolean {
    return this.dk(date) === this.dk(new Date());
  }

  isSunday(date: Date): boolean {
    return date.getDay() === 0;
  }

  isSaturday(date: Date): boolean {
    return date.getDay() === 6;
  }

  getCellStyle(res: Reservation | null): Record<string, string> {
    if (!res) return {};
    const cfg = this.statutConfig[res.statut || ''] || { bg: '#e5e7eb', border: '#d1d5db', color: '#374151' };
    return {
      'background-color': cfg.bg,
      'border-left': `3px solid ${cfg.border}`,
    };
  }

  getStatutCfg(statut?: string) {
    return this.statutConfig[statut || ''] || { label: statut || '', color: '#374151', bg: '#f3f4f6', border: '#9ca3af' };
  }

  onCellClick(chambreId: number, date: Date): void {
    const res = this.getRes(chambreId, date);
    if (res) {
      this.selectedReservation = { ...res };
      this.showModal = true;
      this.showPaiementForm = false;
      this.paiementMontant = 0;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReservation = null;
    this.showPaiementForm = false;
  }

  canCheckin(): boolean {
    return this.selectedReservation?.statut === StatutReservation.CONFIRMEE;
  }

  canCheckout(): boolean {
    return this.selectedReservation?.statut === StatutReservation.EN_COURS;
  }

  canCancel(): boolean {
    const s = this.selectedReservation?.statut;
    return s === StatutReservation.EN_ATTENTE || s === StatutReservation.CONFIRMEE;
  }

  canPay(): boolean {
    const s = this.selectedReservation?.statut;
    return s !== StatutReservation.ANNULEE && s !== StatutReservation.TERMINEE && s !== StatutReservation.NO_SHOW;
  }

  doCheckin(): void {
    if (!this.selectedReservation?.id) return;
    this.reservationService.doCheckin(this.selectedReservation.id).subscribe({
      next: (resp) => {
        const updated = (resp as any)?.data ?? resp;
        this.selectedReservation = updated;
        this.loadData();
      },
      error: (e) => alert('Erreur check-in : ' + (e?.error?.message || e.message)),
    });
  }

  doCheckout(): void {
    if (!this.selectedReservation?.id) return;
    this.reservationService.doCheckout(this.selectedReservation.id).subscribe({
      next: (resp) => {
        const updated = (resp as any)?.data ?? resp;
        this.selectedReservation = updated;
        this.loadData();
      },
      error: (e) => alert('Erreur check-out : ' + (e?.error?.message || e.message)),
    });
  }

  doCancel(): void {
    if (!this.selectedReservation?.id) return;
    if (!confirm('Confirmer l\'annulation de cette réservation ?')) return;
    this.reservationService.cancelReservation(this.selectedReservation.id).subscribe({
      next: () => {
        this.closeModal();
        this.loadData();
      },
      error: (e) => alert('Erreur annulation : ' + (e?.error?.message || e.message)),
    });
  }

  submitPaiement(): void {
    if (!this.selectedReservation?.id || this.paiementMontant <= 0) return;
    this.reservationService.addPaiement(this.selectedReservation.id, {
      montant: this.paiementMontant,
      modePaiement: this.paiementMode,
    }).subscribe({
      next: (resp) => {
        const updated = (resp as any)?.data ?? resp;
        this.selectedReservation = updated;
        this.showPaiementForm = false;
        this.paiementMontant = 0;
        this.loadData();
      },
      error: (e) => alert('Erreur paiement : ' + (e?.error?.message || e.message)),
    });
  }

  printFacture(): void {
    const res = this.selectedReservation;
    if (!res) return;
    const cfg = this.getStatutCfg(res.statut);
    const dateArr = res.dateArrivee ? new Date(res.dateArrivee).toLocaleDateString('fr-FR') : '-';
    const dateDep = res.dateDepart ? new Date(res.dateDepart).toLocaleDateString('fr-FR') : '-';
    const now = new Date().toLocaleDateString('fr-FR');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture – ${res.numeroReservation}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; color: #1a1a2e; background: #fff; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a1a2e; padding-bottom: 24px; margin-bottom: 32px; }
    .logo { font-size: 28px; font-weight: bold; letter-spacing: 2px; }
    .logo span { color: #b8860b; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 20px; text-transform: uppercase; letter-spacing: 3px; }
    .invoice-meta p { color: #555; font-size: 13px; margin-top: 4px; }
    .parties { display: flex; gap: 40px; margin-bottom: 32px; }
    .party { flex: 1; }
    .party h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #888; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 12px; }
    .party p { font-size: 14px; line-height: 1.8; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #1a1a2e; color: #fff; padding: 10px 14px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    td { padding: 12px 14px; border-bottom: 1px solid #eee; font-size: 14px; }
    tr:nth-child(even) td { background: #f9f9f9; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-box { width: 300px; border: 1px solid #ddd; }
    .totals-row { display: flex; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #eee; font-size: 14px; }
    .totals-row.total { background: #1a1a2e; color: #fff; font-weight: bold; font-size: 16px; }
    .totals-row.paye { background: #d1fae5; color: #065f46; font-weight: bold; }
    .totals-row.reste { background: #fee2e2; color: #991b1b; font-weight: bold; }
    .statut-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${cfg.bg}; color: ${cfg.color}; border: 1px solid ${cfg.border}; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 12px; color: #888; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">MA<span>GESTION</span>HOTEL</div>
    <div class="invoice-meta">
      <h2>Reçu de réservation</h2>
      <p>N° ${res.numeroReservation}</p>
      <p>Émis le ${now}</p>
      <p style="margin-top:8px"><span class="statut-badge">${cfg.label}</span></p>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Client</h3>
      <p><strong>${res.clientPrenom || ''} ${res.clientNom || ''}</strong></p>
      ${res.clientTelephone ? `<p>Tél : ${res.clientTelephone}</p>` : ''}
    </div>
    <div class="party">
      <h3>Séjour</h3>
      <p>Chambre : <strong>${res.chambreNumero || res.chambreId}</strong></p>
      <p>Arrivée : <strong>${dateArr}</strong></p>
      <p>Départ : <strong>${dateDep}</strong></p>
      <p>Durée : <strong>${res.nombreNuits || '-'} nuit(s)</strong></p>
      <p>Adultes / Enfants : ${res.nombreAdultes || 1} / ${res.nombreEnfants || 0}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Désignation</th>
        <th>Détail</th>
        <th style="text-align:right">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Hébergement – Chambre ${res.chambreNumero || res.chambreId}</td>
        <td>${res.nombreNuits || '-'} nuit(s) × ${(res.prixParNuit || 0).toLocaleString('fr-FR')} F CFA</td>
        <td style="text-align:right">${(res.montantTotal || 0).toLocaleString('fr-FR')} F CFA</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-box">
      <div class="totals-row total">
        <span>Total</span>
        <span>${(res.montantTotal || 0).toLocaleString('fr-FR')} F CFA</span>
      </div>
      <div class="totals-row paye">
        <span>Montant payé</span>
        <span>${(res.montantPaye || 0).toLocaleString('fr-FR')} F CFA</span>
      </div>
      <div class="totals-row reste">
        <span>Reste à payer</span>
        <span>${(res.montantRestant || 0).toLocaleString('fr-FR')} F CFA</span>
      </div>
    </div>
  </div>

  ${res.notes ? `<div style="margin-top:32px; padding:16px; background:#f9f9f9; border-left:3px solid #b8860b; font-size:13px"><strong>Notes :</strong> ${res.notes}</div>` : ''}

  <div class="footer">
    <span>MaGestionHotel – Système de gestion hôtelière</span>
    <span>Document généré le ${now}</span>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  }

  navigateDays(delta: number): void {
    this.startDate = new Date(this.startDate);
    this.startDate.setDate(this.startDate.getDate() + delta);
    this.endDate = new Date(this.startDate);
    this.endDate.setDate(this.endDate.getDate() + this.daysCount);
    this.buildDates();
  }

  goToToday(): void {
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 3);
    this.endDate = new Date(this.startDate);
    this.endDate.setDate(this.endDate.getDate() + this.daysCount);
    this.buildDates();
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }

  formatDateLong(d: string | Date | undefined): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatMontant(m: number | undefined): string {
    return (m || 0).toLocaleString('fr-FR') + ' F CFA';
  }

  getDayName(d: Date): string {
    return d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3).toUpperCase();
  }

  getMonthLabel(): string {
    const months = new Set(this.dates.map(d => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })));
    return Array.from(months).join(' – ');
  }

  trackDate(_i: number, d: Date): string { return d.toISOString(); }
  trackChambre(_i: number, c: Chambre): number { return c.id!; }
}
