package com.mghbackend.repository;

import com.mghbackend.entity.Client;
import com.mghbackend.entity.CommandeRestaurant;
import com.mghbackend.entity.Hotel;
import com.mghbackend.entity.Reservation;
import com.mghbackend.enums.StatutCommandeRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommandeRestaurantRepository extends JpaRepository<CommandeRestaurant, Long> {

    List<CommandeRestaurant> findByHotel(Hotel hotel);

    List<CommandeRestaurant> findByHotelAndStatut(Hotel hotel, StatutCommandeRestaurant statut);

    List<CommandeRestaurant> findByClient(Client client);

    List<CommandeRestaurant> findByReservation(Reservation reservation);

    Optional<CommandeRestaurant> findByNumeroCommande(String numeroCommande);
}