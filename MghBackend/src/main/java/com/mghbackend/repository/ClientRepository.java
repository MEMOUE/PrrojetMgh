package com.mghbackend.repository;

import com.mghbackend.entity.Client;
import com.mghbackend.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    List<Client> findByHotel(Hotel hotel);

    Optional<Client> findByHotelAndEmail(Hotel hotel, String email);

    Optional<Client> findByHotelAndTelephone(Hotel hotel, String telephone);

    Optional<Client> findByHotelAndPieceIdentite(Hotel hotel, String pieceIdentite);

    boolean existsByHotelAndEmail(Hotel hotel, String email);

    boolean existsByHotelAndTelephone(Hotel hotel, String telephone);

    @Query("SELECT c FROM Client c WHERE c.hotel = :hotel AND " +
            "(c.nom LIKE %:keyword% OR c.prenom LIKE %:keyword% OR " +
            "c.email LIKE %:keyword% OR c.telephone LIKE %:keyword% OR " +
            "c.pieceIdentite LIKE %:keyword%)")
    List<Client> searchByHotelAndKeyword(@Param("hotel") Hotel hotel, @Param("keyword") String keyword);

    long countByHotel(Hotel hotel);

    // Clients fidèles (avec plusieurs réservations)
    @Query("SELECT c FROM Client c WHERE c.hotel = :hotel AND " +
            "(SELECT COUNT(r) FROM Reservation r WHERE r.client = c) >= :minReservations")
    List<Client> findClientsFideles(@Param("hotel") Hotel hotel, @Param("minReservations") int minReservations);
}