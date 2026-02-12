package com.mghbackend.entity;

import com.mghbackend.enums.StatutFacture;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "factures")
@Data
@EqualsAndHashCode(callSuper = true)
public class Facture extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String numeroFacture;

    @Column(nullable = false)
    private LocalDate dateEmission;

    @Column(nullable = false)
    private LocalDate dateEcheance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutFacture statut = StatutFacture.BROUILLON;

    // Client
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    // OU Réservation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    // OU Commande Restaurant
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_restaurant_id")
    private CommandeRestaurant commandeRestaurant;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montantHT = BigDecimal.ZERO;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal tauxTVA = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montantTVA = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montantTTC = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal montantPaye = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal montantRestant = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LigneFacture> lignes = new ArrayList<>();
}