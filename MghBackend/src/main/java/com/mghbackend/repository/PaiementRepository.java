package com.mghbackend.repository;

import com.mghbackend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {

    List<Paiement> findByHotel(Hotel hotel);

    List<Paiement> findByFacture(Facture facture);

    List<Paiement> findByReservation(Reservation reservation);

    List<Paiement> findByCommandeRestaurant(CommandeRestaurant commandeRestaurant);
}