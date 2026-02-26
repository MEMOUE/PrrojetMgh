package com.mghbackend.repository;

import com.mghbackend.entity.Hotel;
import com.mghbackend.entity.Produit;
import com.mghbackend.enums.TypeProduit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByHotel(Hotel hotel);

    Optional<Produit> findByCode(String code);

    // ── Filtres pour le menu restaurant ────────────────────────

    /** Tous les produits d'un type (ex. toutes les BOISSON d'un hôtel) */
    List<Produit> findByHotelAndTypeProduit(Hotel hotel, TypeProduit typeProduit);

    /** Produits disponibles d'un type (pour l'affichage menu) */
    List<Produit> findByHotelAndTypeProduitAndDisponibleTrue(Hotel hotel, TypeProduit typeProduit);

    /** Tous les produits disponibles (menu complet) */
    List<Produit> findByHotelAndDisponibleTrue(Hotel hotel);

    // ── Alertes stock ───────────────────────────────────────────

    @Query("SELECT p FROM Produit p WHERE p.hotel = :hotel " +
            "AND p.seuilAlerte IS NOT NULL " +
            "AND p.quantiteStock <= p.seuilAlerte")
    List<Produit> findProduitsEnRuptureStock(@Param("hotel") Hotel hotel);
}