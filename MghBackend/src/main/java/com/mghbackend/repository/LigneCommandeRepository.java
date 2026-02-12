package com.mghbackend.repository;

import com.mghbackend.entity.CommandeRestaurant;
import com.mghbackend.entity.LigneCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LigneCommandeRepository extends JpaRepository<LigneCommande, Long> {

    List<LigneCommande> findByCommande(CommandeRestaurant commande);
}
