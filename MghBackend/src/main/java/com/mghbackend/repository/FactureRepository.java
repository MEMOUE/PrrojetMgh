package com.mghbackend.repository;

import com.mghbackend.entity.*;
import com.mghbackend.enums.StatutFacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Long> {

    List<Facture> findByHotel(Hotel hotel);

    List<Facture> findByHotelAndStatut(Hotel hotel, StatutFacture statut);

    List<Facture> findByClient(Client client);

    List<Facture> findByReservation(Reservation reservation);

    List<Facture> findByCommandeRestaurant(CommandeRestaurant commandeRestaurant);

    Optional<Facture> findByNumeroFacture(String numeroFacture);
}