package com.mghbackend.entity;

import com.mghbackend.enums.StatutCommandeRestaurant;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "commandes_restaurant")
@Data
@EqualsAndHashCode(callSuper = true)
public class CommandeRestaurant extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String numeroCommande;

    // Client externe (sans compte)
    @Column(length = 100)
    private String nomClientExterne;

    @Column(length = 20)
    private String telephoneClientExterne;

    // OU Client de l'hôtel (optionnel)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    // OU Lien avec une réservation (optionnel)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(length = 20)
    private String numeroTable;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCommandeRestaurant statut = StatutCommandeRestaurant.EN_ATTENTE;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montantTotal = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal montantPaye = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private LocalDateTime dateCommande = LocalDateTime.now();

    private LocalDateTime dateService;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User serveur; // Employé qui prend la commande

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LigneCommande> lignes = new ArrayList<>();
}