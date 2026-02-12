package com.mghbackend.repository;

import com.mghbackend.entity.Hotel;
import com.mghbackend.entity.Produit;
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

    @Query("SELECT p FROM Produit p WHERE p.hotel = :hotel AND p.quantiteStock <= p.seuilAlerte")
    List<Produit> findProduitsEnRuptureStock(@Param("hotel") Hotel hotel);
}