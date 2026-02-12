package com.mghbackend.repository;

import com.mghbackend.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

	Optional<Hotel> findByEmail(String email);

	Optional<Hotel> findByEmailAndActiveTrue(String email);

	boolean existsByEmail(String email);

	boolean existsByName(String name);

	List<Hotel> findByActiveTrue();

	List<Hotel> findByActiveFalse();

	@Query("SELECT h FROM Hotel h WHERE h.name LIKE %:keyword% OR h.email LIKE %:keyword%")
	List<Hotel> searchByKeyword(@Param("keyword") String keyword);

	long countByActiveTrue();

	long countByActiveFalse();
}
