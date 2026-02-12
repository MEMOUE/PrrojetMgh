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
  modePaiement?: ModePaiement;
  
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
  
  // Statut
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

export interface CategorieFinanciere {
  id?: number;
  nom: string;
  type: TypeTransaction;
  description?: string;
  budgetMensuel?: number;
  icone?: string;
  couleur?: string;
  actif?: boolean;
  hotelId?: number;
}

export interface RapportFinancier {
  periode: string;
  dateDebut: string;
  dateFin: string;
  
  // Revenus
  totalRevenus: number;
  revenusReservations: number;
  revenusRestaurant: number;
  autresRevenus: number;
  
  // Dépenses
  totalDepenses: number;
  depensesAchats: number;
  depensesSalaires: number;
  depensesCharges: number;
  autresDepenses: number;
  
  // Résultats
  resultatNet: number;
  margeNette: number;
  
  // Évolution
  evolutionRevenus?: number;
  evolutionDepenses?: number;
  evolutionResultat?: number;
  
  // Détails par catégorie
  detailsCategories: DetailCategorie[];
}

export interface DetailCategorie {
  categorie: string;
  type: TypeTransaction;
  montant: number;
  pourcentage: number;
  nombreTransactions: number;
  evolution?: number;
}

export interface StatistiquesFinancieres {
  soldeActuel: number;
  revenusJour: number;
  depensesJour: number;
  revenusMois: number;
  depensesMois: number;
  resultatMois: number;
  
  topCategories: {
    categorie: string;
    montant: number;
  }[];
  
  evolutionMensuelle: {
    mois: string;
    revenus: number;
    depenses: number;
    resultat: number;
  }[];
  
  transactionsEnAttente: number;
  montantEnAttente: number;
}

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

export enum ModePaiement {
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

// Labels pour les types de transaction
export const TYPE_TRANSACTION_LABELS: Record<TypeTransaction, string> = {
  [TypeTransaction.REVENU]: 'Revenu',
  [TypeTransaction.DEPENSE]: 'Dépense'
};

// Couleurs pour les types de transaction
export const TYPE_TRANSACTION_COLORS: Record<TypeTransaction, string> = {
  [TypeTransaction.REVENU]: 'success',
  [TypeTransaction.DEPENSE]: 'danger'
};

// Labels pour les statuts
export const STATUT_TRANSACTION_LABELS: Record<StatutTransaction, string> = {
  [StatutTransaction.EN_ATTENTE]: 'En attente',
  [StatutTransaction.VALIDEE]: 'Validée',
  [StatutTransaction.ANNULEE]: 'Annulée',
  [StatutTransaction.REMBOURSEE]: 'Remboursée'
};

// Couleurs pour les statuts
export const STATUT_TRANSACTION_COLORS: Record<StatutTransaction, string> = {
  [StatutTransaction.EN_ATTENTE]: 'warning',
  [StatutTransaction.VALIDEE]: 'success',
  [StatutTransaction.ANNULEE]: 'danger',
  [StatutTransaction.REMBOURSEE]: 'info'
};

// Labels pour les modes de paiement
export const MODE_PAIEMENT_LABELS: Record<ModePaiement, string> = {
  [ModePaiement.ESPECES]: 'Espèces',
  [ModePaiement.CARTE_BANCAIRE]: 'Carte bancaire',
  [ModePaiement.VIREMENT]: 'Virement',
  [ModePaiement.CHEQUE]: 'Chèque',
  [ModePaiement.MOBILE_MONEY]: 'Mobile Money',
  [ModePaiement.ORANGE_MONEY]: 'Orange Money',
  [ModePaiement.MTN_MONEY]: 'MTN Money',
  [ModePaiement.WAVE]: 'Wave',
  [ModePaiement.MOOV_MONEY]: 'Moov Money'
};

// Catégories de revenus par défaut
export const CATEGORIES_REVENUS = [
  { nom: 'Hébergement', icone: 'pi-home', couleur: '#4CAF50' },
  { nom: 'Restauration', icone: 'pi-shopping-cart', couleur: '#FF9800' },
  { nom: 'Services', icone: 'pi-briefcase', couleur: '#2196F3' },
  { nom: 'Location salle', icone: 'pi-building', couleur: '#9C27B0' },
  { nom: 'Autres revenus', icone: 'pi-dollar', couleur: '#00BCD4' }
];

// Catégories de dépenses par défaut
export const CATEGORIES_DEPENSES = [
  { nom: 'Achats stock', icone: 'pi-shopping-bag', couleur: '#F44336' },
  { nom: 'Salaires', icone: 'pi-users', couleur: '#E91E63' },
  { nom: 'Charges fixes', icone: 'pi-bolt', couleur: '#9E9E9E' },
  { nom: 'Maintenance', icone: 'pi-wrench', couleur: '#FF5722' },
  { nom: 'Marketing', icone: 'pi-megaphone', couleur: '#673AB7' },
  { nom: 'Fournitures', icone: 'pi-box', couleur: '#795548' },
  { nom: 'Autres dépenses', icone: 'pi-wallet', couleur: '#607D8B' }
];