package com.mghbackend.repository;

import com.mghbackend.entity.Hotel;
import com.mghbackend.entity.ProduitMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitMenuRepository extends JpaRepository<ProduitMenu, Long> {

    List<ProduitMenu> findByHotel(Hotel hotel);

    List<ProduitMenu> findByHotelAndDisponibleTrue(Hotel hotel);

    List<ProduitMenu> findByHotelAndCategorie(Hotel hotel, String categorie);
}