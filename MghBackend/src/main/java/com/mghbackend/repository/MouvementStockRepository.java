package com.mghbackend.repository;

import com.mghbackend.entity.Hotel;
import com.mghbackend.entity.MouvementStock;
import com.mghbackend.entity.Produit;
import com.mghbackend.enums.TypeMouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MouvementStockRepository extends JpaRepository<MouvementStock, Long> {

    List<MouvementStock> findByHotel(Hotel hotel);

    List<MouvementStock> findByProduit(Produit produit);

    // ── Triés du plus récent au plus ancien ──────────────────────

    List<MouvementStock> findByHotelOrderByDateMouvementDesc(Hotel hotel);

    List<MouvementStock> findByProduitOrderByDateMouvementDesc(Produit produit);

    // ── Filtres par type ──────────────────────────────────────────

    List<MouvementStock> findByHotelAndTypeOrderByDateMouvementDesc(Hotel hotel, TypeMouvement type);

    // ── Comptages ────────────────────────────────────────────────

    long countByHotel(Hotel hotel);

    long countByHotelAndType(Hotel hotel, TypeMouvement type);
}