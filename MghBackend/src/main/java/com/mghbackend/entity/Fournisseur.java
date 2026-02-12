package com.mghbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "fournisseurs")
@Data
@EqualsAndHashCode(callSuper = true)
public class Fournisseur extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(length = 20)
    private String telephone;

    @Column(length = 100)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String adresse;

    @Column(length = 100)
    private String contact; // Nom du contact

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private Boolean actif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;
}