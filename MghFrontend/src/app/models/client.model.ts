// ===============================
// MODÈLE CLIENT
// Compatible avec le backend Spring Boot
// ===============================

export interface Client {
  id?: number;
  prenom: string;
  nom: string;
  email?: string;
  telephone: string;
  pieceIdentite?: string;
  typePiece?: string;
  dateNaissance?: string | Date;
  nationalite?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  notes?: string;
  hotelId?: number;
  hotelName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Types de pièces d'identité
export const TYPES_PIECE = [
  { value: 'CNI', label: 'Carte Nationale d\'Identité' },
  { value: 'PASSEPORT', label: 'Passeport' },
  { value: 'PERMIS', label: 'Permis de conduire' },
  { value: 'CARTE_SEJOUR', label: 'Carte de séjour' },
  { value: 'AUTRE', label: 'Autre' }
];

// Pays les plus courants (vous pouvez étendre cette liste)
export const PAYS_COURANTS = [
  'Côte d\'Ivoire',
  'Sénégal',
  'Mali',
  'Burkina Faso',
  'Niger',
  'Togo',
  'Bénin',
  'Guinée',
  'France',
  'États-Unis',
  'Canada',
  'Belgique',
  'Suisse',
  'Maroc',
  'Tunisie',
  'Algérie'
];