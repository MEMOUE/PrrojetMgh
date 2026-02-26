package com.mghbackend.dto;

import com.mghbackend.enums.ModePaiementTransaction;
import com.mghbackend.enums.StatutTransaction;
import com.mghbackend.enums.TypeTransaction;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionDto {
    private Long id;

    /** Référence auto-générée (ex: TRX-2025-00001) */
    private String reference;

    private TypeTransaction type;
    private String categorie;
    private BigDecimal montant;
    private LocalDateTime dateTransaction;
    private String description;
    private ModePaiementTransaction modePaiement;
    private StatutTransaction statut;

    // Relations réservation
    private Long reservationId;
    private String reservationNumero;

    // Relations commande restaurant
    private Long commandeRestaurantId;
    private String commandeNumero;

    // Fournisseur (pour les dépenses)
    private Long fournisseurId;
    private String fournisseurNom;

    // Pièce justificative
    private String numeroPiece;
    private String pieceJustificative;

    // Validation
    private String validePar;
    private LocalDateTime dateValidation;

    private String notes;
    private Long hotelId;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}