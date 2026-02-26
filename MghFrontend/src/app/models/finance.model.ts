// ===============================
// MODELS POUR LA GESTION FINANCIÈRE
// Compatible avec le backend Spring Boot
// ===============================

export interface Transaction {
  id?: number;
  reference?: string;
  type: TypeTransaction;
  categorie: string;
  montant: number;
  description?: string;
  dateTransaction: string | Date;
  modePaiement?: ModePaiementTransaction;

  // Relations
  reservationId?: number;
  reservationNumero?: string;
  commandeRestaurantId?: number;
  commandeNumero?: string;
  fournisseurId?: number;
  fournisseurNom?: string;

  // Pièce justificative
  pieceJustificative?: string;
  numeroPiece?: string;

  // Statut & validation
  statut: StatutTransaction;
  validePar?: string;
  dateValidation?: string;

  // Informations système
  hotelId?: number;
  createdById?: number;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;

  notes?: string;
}

// ─── Statistiques ──────────────────────────────────────────────────────────

export interface StatistiquesFinancieres {
  // Solde
  soldeActuel: number;
  solde: number;

  // Totaux
  totalRevenus: number;
  totalDepenses: number;

  // Jour
  revenusJour: number;
  depensesJour: number;

  // Mois
  revenusMois: number;
  depensesMois: number;
  resultatMois: number;

  // Transactions
  nombreTransactions: number;
  transactionsEnAttente: number;
  montantEnAttente: number;

  // Détails
  topCategories: { categorie: string; montant: number }[];
  evolutionMensuelle: {
    mois: string;
    revenus: number;
    depenses: number;
    resultat: number;
  }[];
}

// ─── Enums ─────────────────────────────────────────────────────────────────

export enum TypeTransaction {
  REVENU = 'REVENU',
  DEPENSE = 'DEPENSE'
}

export enum StatutTransaction {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDEE = 'VALIDEE',
  ANNULEE = 'ANNULEE',
  REMBOURSEE = 'REMBOURSEE'
}

/** Doit correspondre exactement à l'enum backend ModePaiementTransaction */
export enum ModePaiementTransaction {
  ESPECES = 'ESPECES',
  CARTE_BANCAIRE = 'CARTE_BANCAIRE',
  VIREMENT = 'VIREMENT',
  CHEQUE = 'CHEQUE',
  MOBILE_MONEY = 'MOBILE_MONEY',
  ORANGE_MONEY = 'ORANGE_MONEY',
  MTN_MONEY = 'MTN_MONEY',
  WAVE = 'WAVE',
  MOOV_MONEY = 'MOOV_MONEY'
}

// Alias pour compatibilité avec l'ancien nom utilisé dans les composants
export { ModePaiementTransaction as ModePaiement };

// ─── Labels ────────────────────────────────────────────────────────────────

export const TYPE_TRANSACTION_LABELS: Record<TypeTransaction, string> = {
  [TypeTransaction.REVENU]: 'Revenu',
  [TypeTransaction.DEPENSE]: 'Dépense'
};

export const TYPE_TRANSACTION_COLORS: Record<TypeTransaction, string> = {
  [TypeTransaction.REVENU]: 'success',
  [TypeTransaction.DEPENSE]: 'danger'
};

export const STATUT_TRANSACTION_LABELS: Record<StatutTransaction, string> = {
  [StatutTransaction.EN_ATTENTE]: 'En attente',
  [StatutTransaction.VALIDEE]: 'Validée',
  [StatutTransaction.ANNULEE]: 'Annulée',
  [StatutTransaction.REMBOURSEE]: 'Remboursée'
};

export const STATUT_TRANSACTION_COLORS: Record<StatutTransaction, string> = {
  [StatutTransaction.EN_ATTENTE]: 'warning',
  [StatutTransaction.VALIDEE]: 'success',
  [StatutTransaction.ANNULEE]: 'danger',
  [StatutTransaction.REMBOURSEE]: 'info'
};

export const MODE_PAIEMENT_LABELS: Record<ModePaiementTransaction, string> = {
  [ModePaiementTransaction.ESPECES]: 'Espèces',
  [ModePaiementTransaction.CARTE_BANCAIRE]: 'Carte bancaire',
  [ModePaiementTransaction.VIREMENT]: 'Virement',
  [ModePaiementTransaction.CHEQUE]: 'Chèque',
  [ModePaiementTransaction.MOBILE_MONEY]: 'Mobile Money',
  [ModePaiementTransaction.ORANGE_MONEY]: 'Orange Money',
  [ModePaiementTransaction.MTN_MONEY]: 'MTN Money',
  [ModePaiementTransaction.WAVE]: 'Wave',
  [ModePaiementTransaction.MOOV_MONEY]: 'Moov Money'
};

// ─── Catégories ────────────────────────────────────────────────────────────

export const CATEGORIES_REVENUS = [
  { nom: 'Hébergement', icone: 'pi-home', couleur: '#4CAF50' },
  { nom: 'Restauration', icone: 'pi-shopping-cart', couleur: '#FF9800' },
  { nom: 'Services', icone: 'pi-briefcase', couleur: '#2196F3' },
  { nom: 'Location salle', icone: 'pi-building', couleur: '#9C27B0' },
  { nom: 'Autres revenus', icone: 'pi-dollar', couleur: '#00BCD4' }
];

export const CATEGORIES_DEPENSES = [
  { nom: 'Achats stock', icone: 'pi-shopping-bag', couleur: '#F44336' },
  { nom: 'Salaires', icone: 'pi-users', couleur: '#E91E63' },
  { nom: 'Charges fixes', icone: 'pi-bolt', couleur: '#9E9E9E' },
  { nom: 'Maintenance', icone: 'pi-wrench', couleur: '#FF5722' },
  { nom: 'Marketing', icone: 'pi-megaphone', couleur: '#673AB7' },
  { nom: 'Fournitures', icone: 'pi-box', couleur: '#795548' },
  { nom: 'Autres dépenses', icone: 'pi-wallet', couleur: '#607D8B' }
];
