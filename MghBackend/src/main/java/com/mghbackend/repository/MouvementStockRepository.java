package com.mghbackend.repository;

import com.mghbackend.entity.Hotel;
import com.mghbackend.entity.MouvementStock;
import com.mghbackend.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MouvementStockRepository extends JpaRepository<MouvementStock, Long> {

    List<MouvementStock> findByHotel(Hotel hotel);

    List<MouvementStock> findByProduit(Produit produit);
}