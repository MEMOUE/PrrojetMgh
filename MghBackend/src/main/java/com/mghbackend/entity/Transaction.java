package com.mghbackend.entity;

import com.mghbackend.enums.ModePaiementTransaction;
import com.mghbackend.enums.StatutTransaction;
import com.mghbackend.enums.TypeTransaction;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeTransaction type;

    @Column(nullable = false)
    private String categorie;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    private LocalDateTime dateTransaction;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    private ModePaiementTransaction modePaiement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutTransaction statut = StatutTransaction.EN_ATTENTE;

    // Relations
    private Long reservationId;
    private Long commandeRestaurantId;
    private Long fournisseurId;

    // Pièce justificative
    private String numeroPiece;
    private String pieceJustificative;

    // Validation
    private String validePar;
    private LocalDateTime dateValidation;

    @Column(length = 1000)
    private String notes;

    // Métadonnées
    @Column(nullable = false)
    private Long hotelId;

    private Long createdById;
    private String createdByName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}