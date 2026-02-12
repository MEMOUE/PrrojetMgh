// ===============================
// MODELS POUR LE SYSTÈME HÔTELIER
// Compatible avec le backend Spring Boot
// ===============================

export interface Hotel {
  id?: number;
  nom: string;
  adresse: string;
  ville: string;
  pays: string;
  codePostal?: string;
  telephone: string;
  email: string;
  siteWeb?: string;
  nombreEtoiles?: number;
  description?: string;
  equipements?: string[];
  imagePrincipale?: string;
  imagesSecondaires?: string[];
  capaciteTotale?: number;
  nombreChambres?: number;
  disponible?: boolean;
  taxNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface compatible avec le backend Spring Boot
export interface Chambre {
  id?: number;
  numero: string;
  type: string;  // TypeChambre enum
  prixParNuit: number;
  capacite: number;  // Capacité totale
  superficie: number;
  description?: string;
  statut: string;  // StatutChambre enum
  etage: number;
  
  // Équipements (noms exacts du backend)
  wifi?: boolean;
  climatisation?: boolean;
  television?: boolean;
  minibar?: boolean;
  coffre?: boolean;  // PAS coffre_fort
  balcon?: boolean;
  vueMer?: boolean;  // PAS vue_mer
  
  // Champs en lecture seule
  hotelId?: number;
  hotelName?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export enum TypeChambre {
  SIMPLE = 'SIMPLE',
  DOUBLE = 'DOUBLE',
  TWIN = 'TWIN',
  TRIPLE = 'TRIPLE',
  SUITE = 'SUITE',
  SUITE_JUNIOR = 'SUITE_JUNIOR',
  SUITE_PRESIDENTIELLE = 'SUITE_PRESIDENTIELLE',
  FAMILIALE = 'FAMILIALE',
  DELUXE = 'DELUXE'
}

export enum StatutChambre {
  DISPONIBLE = 'DISPONIBLE',
  OCCUPEE = 'OCCUPEE',
  RESERVEE = 'RESERVEE',
  EN_NETTOYAGE = 'EN_NETTOYAGE',
  EN_MAINTENANCE = 'EN_MAINTENANCE',
  HORS_SERVICE = 'HORS_SERVICE'
}

export interface ChambreFilter {
  hotelId?: number;
  type?: string;
  etage?: number;
  capacite?: number;
  prixMin?: number;
  prixMax?: number;
  statut?: string;
}

export interface HotelFilter {
  ville?: string;
  pays?: string;
  nombre_etoiles?: number;
  prix_min?: number;
  prix_max?: number;
  capacite_min?: number;
  disponible?: boolean;
  equipements?: string[];
}

// Labels pour les types de chambres
export const TYPE_CHAMBRE_LABELS: Record<TypeChambre, string> = {
  [TypeChambre.SIMPLE]: 'Chambre Simple',
  [TypeChambre.DOUBLE]: 'Chambre Double',
  [TypeChambre.TWIN]: 'Chambre Twin',
  [TypeChambre.TRIPLE]: 'Chambre Triple',
  [TypeChambre.SUITE]: 'Suite',
  [TypeChambre.SUITE_JUNIOR]: 'Suite Junior',
  [TypeChambre.SUITE_PRESIDENTIELLE]: 'Suite Présidentielle',
  [TypeChambre.FAMILIALE]: 'Chambre Familiale',
  [TypeChambre.DELUXE]: 'Chambre Deluxe'
};

// Labels pour les statuts de chambres
export const STATUT_CHAMBRE_LABELS: Record<StatutChambre, string> = {
  [StatutChambre.DISPONIBLE]: 'Disponible',
  [StatutChambre.OCCUPEE]: 'Occupée',
  [StatutChambre.RESERVEE]: 'Réservée',
  [StatutChambre.EN_NETTOYAGE]: 'En nettoyage',
  [StatutChambre.EN_MAINTENANCE]: 'En maintenance',
  [StatutChambre.HORS_SERVICE]: 'Hors service'
};

// Couleurs pour les statuts
export const STATUT_CHAMBRE_COLORS: Record<StatutChambre, string> = {
  [StatutChambre.DISPONIBLE]: 'success',
  [StatutChambre.OCCUPEE]: 'danger',
  [StatutChambre.RESERVEE]: 'warning',
  [StatutChambre.EN_NETTOYAGE]: 'info',
  [StatutChambre.EN_MAINTENANCE]: 'warning',
  [StatutChambre.HORS_SERVICE]: 'secondary'
};

// ...existing code...

export interface Reservation {
  id?: number;
  numeroReservation?: string;
  chambreId: number;
  dateArrivee: Date | string;
  dateDepart: Date | string;
  nombreAdultes: number;
  nombreEnfants?: number;
  clientPrenom: string;
  clientNom: string;
  clientTelephone: string;
  clientEmail?: string;
  clientTypePiece?: string;
  clientPieceIdentite?: string;
  clientDateNaissance?: Date | string;
  clientNationalite?: string;
  clientAdresse?: string;
  clientVille?: string;
  clientPays?: string;
  montantPaye?: number;
  modePaiement?: string;
  notes?: string;
  demandesSpeciales?: string;
};

// ...existing code...
// Équipements disponibles
export const EQUIPEMENTS_CHAMBRE = [
  'WiFi',
  'Climatisation',
  'Télévision',
  'Minibar',
  'Coffre-fort',
  'Bureau',
  'Balcon',
  'Vue mer',
  'Vue montagne',
  'Salle de bain privée',
  'Baignoire',
  'Douche',
  'Sèche-cheveux',
  'Peignoir',
  'Chaussons',
  'Kit de toilette',
  'Téléphone',
  'Service en chambre',
  'Fer à repasser',
  'Machine à café',
  'Bouilloire',
  'Réfrigérateur',
  'Four micro-ondes',
  'Kitchenette',
  'Insonorisation',
  'Fenêtres anti-bruit',
  'Lit King Size',
  'Lit Queen Size',
  'Canapé-lit',
  'Lit bébé (sur demande)',
  'Chaise haute (sur demande)'
];

// Équipements de l'hôtel
export const EQUIPEMENTS_HOTEL = [
  'Restaurant',
  'Bar',
  'Piscine',
  'Spa',
  'Salle de sport',
  'Parking',
  'WiFi gratuit',
  'Réception 24h/24',
  'Service de conciergerie',
  'Navette aéroport',
  'Location de voitures',
  'Service de blanchisserie',
  'Salle de réunion',
  'Centre d\'affaires',
  'Jardin',
  'Terrasse',
  'Ascenseur',
  'Accès handicapés',
  'Coffre-fort à la réception',
  'Consigne à bagages',
  'Service d\'étage',
  'Room service 24h/24',
  'Petit-déjeuner buffet',
  'Animaux acceptés',
  'Garde d\'enfants',
  'Aire de jeux pour enfants',
  'Club enfants',
  'Piscine pour enfants',
  'Casino',
  'Discothèque',
  'Boutiques',
  'Salon de coiffure',
  'Hammam',
  'Sauna',
  'Jacuzzi',
  'Massage',
  'Terrain de tennis',
  'Terrain de golf',
  'Plage privée',
  'Sports nautiques'
];