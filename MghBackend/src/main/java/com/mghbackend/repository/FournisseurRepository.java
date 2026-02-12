package com.mghbackend.repository;

import com.mghbackend.entity.Fournisseur;
import com.mghbackend.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FournisseurRepository extends JpaRepository<Fournisseur, Long> {

    List<Fournisseur> findByHotel(Hotel hotel);

    List<Fournisseur> findByHotelAndActifTrue(Hotel hotel);
}