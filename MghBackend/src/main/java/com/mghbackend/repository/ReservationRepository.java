package com.mghbackend.repository;

import com.mghbackend.entity.Chambre;
import com.mghbackend.entity.Client;
import com.mghbackend.entity.Hotel;
import com.mghbackend.entity.Reservation;
import com.mghbackend.enums.StatutReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByHotel(Hotel hotel);

    List<Reservation> findByHotelAndStatut(Hotel hotel, StatutReservation statut);

    List<Reservation> findByClient(Client client);

    List<Reservation> findByChambre(Chambre chambre);

    Optional<Reservation> findByNumeroReservation(String numeroReservation);

    boolean existsByNumeroReservation(String numeroReservation);

    // Réservations pour une chambre sur une période donnée
    @Query("SELECT r FROM Reservation r WHERE r.chambre = :chambre AND " +
            "r.statut NOT IN ('ANNULEE', 'TERMINEE') AND " +
            "(r.dateArrivee <= :dateDepart AND r.dateDepart >= :dateArrivee)")
    List<Reservation> findReservationsByChambreAndPeriode(
            @Param("chambre") Chambre chambre,
            @Param("dateArrivee") LocalDate dateArrivee,
            @Param("dateDepart") LocalDate dateDepart
    );

    // Réservations d'aujourd'hui pour un hôtel
    @Query("SELECT r FROM Reservation r WHERE r.hotel = :hotel AND r.dateArrivee = :date")
    List<Reservation> findArrivalsForToday(@Param("hotel") Hotel hotel, @Param("date") LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE r.hotel = :hotel AND r.dateDepart = :date")
    List<Reservation> findDeparturesForToday(@Param("hotel") Hotel hotel, @Param("date") LocalDate date);

    // Réservations en cours
    @Query("SELECT r FROM Reservation r WHERE r.hotel = :hotel AND r.statut = 'EN_COURS'")
    List<Reservation> findReservationsEnCours(@Param("hotel") Hotel hotel);

    // Réservations à venir
    @Query("SELECT r FROM Reservation r WHERE r.hotel = :hotel AND " +
            "r.statut = 'CONFIRMEE' AND r.dateArrivee > :date")
    List<Reservation> findReservationsAVenir(@Param("hotel") Hotel hotel, @Param("date") LocalDate date);

    // Recherche par mots-clés
    @Query("SELECT r FROM Reservation r WHERE r.hotel = :hotel AND " +
            "(r.numeroReservation LIKE %:keyword% OR " +
            "r.client.nom LIKE %:keyword% OR r.client.prenom LIKE %:keyword% OR " +
            "r.chambre.numero LIKE %:keyword%)")
    List<Reservation> searchByHotelAndKeyword(@Param("hotel") Hotel hotel, @Param("keyword") String keyword);

    // Statistiques
    long countByHotel(Hotel hotel);

    long countByHotelAndStatut(Hotel hotel, StatutReservation statut);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.hotel = :hotel AND " +
            "r.dateArrivee BETWEEN :startDate AND :endDate")
    long countReservationsByPeriode(
            @Param("hotel") Hotel hotel,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT SUM(r.montantTotal) FROM Reservation r WHERE r.hotel = :hotel AND " +
            "r.statut NOT IN ('ANNULEE') AND " +
            "r.dateArrivee BETWEEN :startDate AND :endDate")
    Long sumRevenuByPeriode(
            @Param("hotel") Hotel hotel,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}