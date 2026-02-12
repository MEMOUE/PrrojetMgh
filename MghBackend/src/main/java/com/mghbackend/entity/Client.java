package com.mghbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clients")
@Data
@EqualsAndHashCode(callSuper = true)
public class Client extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String prenom;

    @Column(nullable = false, length = 50)
    private String nom;

    @Column(unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String telephone;

    @Column(length = 50)
    private String pieceIdentite; // Numéro de pièce d'identité

    @Column(length = 50)
    private String typePiece; // CNI, Passeport, etc.

    private LocalDate dateNaissance;

    @Column(length = 50)
    private String nationalite;

    @Column(columnDefinition = "TEXT")
    private String adresse;

    @Column(length = 50)
    private String ville;

    @Column(length = 50)
    private String pays;

    @Column(columnDefinition = "TEXT")
    private String notes; // Notes internes

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Reservation> reservations = new ArrayList<>();
}