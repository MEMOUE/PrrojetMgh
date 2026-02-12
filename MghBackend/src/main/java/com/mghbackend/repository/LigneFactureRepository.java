package com.mghbackend.repository;

import com.mghbackend.entity.Facture;
import com.mghbackend.entity.LigneFacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LigneFactureRepository extends JpaRepository<LigneFacture, Long> {

    List<LigneFacture> findByFacture(Facture facture);
}