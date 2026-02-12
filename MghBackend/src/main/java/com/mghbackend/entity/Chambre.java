package com.mghbackend.entity;

import com.mghbackend.enums.StatutChambre;
import com.mghbackend.enums.TypeChambre;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chambres")
@Data
@EqualsAndHashCode(callSuper = true)
public class Chambre extends BaseEntity {

    @Column(nullable = false, length = 20)
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeChambre type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixParNuit;

    @Column(nullable = false)
    private Integer capacite;

    @Column(nullable = false)
    private Integer superficie; // en m²

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutChambre statut = StatutChambre.DISPONIBLE;

    @Column(nullable = false)
    private Integer etage;

    // Équipements
    private Boolean wifi = true;
    private Boolean climatisation = true;
    private Boolean television = true;
    private Boolean minibar = false;
    private Boolean coffre = false;
    private Boolean balcon = false;
    private Boolean vueMer = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @OneToMany(mappedBy = "chambre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Reservation> reservations = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "chambre_images", joinColumns = @JoinColumn(name = "chambre_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();
}