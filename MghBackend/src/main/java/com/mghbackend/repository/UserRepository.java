package com.mghbackend.repository;

import com.mghbackend.entity.User;
import com.mghbackend.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);

	Optional<User> findByUsername(String username);

	Optional<User> findByEmailAndActiveTrue(String email);

	Optional<User> findByUsernameAndActiveTrue(String username);

	boolean existsByEmail(String email);

	boolean existsByUsername(String username);

	List<User> findByHotel(Hotel hotel);

	List<User> findByHotelAndActiveTrue(Hotel hotel);

	List<User> findByHotelAndActiveFalse(Hotel hotel);

	List<User> findByActiveTrue();

	List<User> findByActiveFalse();

	@Query("SELECT u FROM User u WHERE u.hotel = :hotel AND " +
			"(u.firstName LIKE %:keyword% OR u.lastName LIKE %:keyword% OR u.email LIKE %:keyword% OR u.username LIKE %:keyword%)")
	List<User> searchByHotelAndKeyword(@Param("hotel") Hotel hotel, @Param("keyword") String keyword);

	long countByHotel(Hotel hotel);

	long countByHotelAndActiveTrue(Hotel hotel);

	long countByHotelAndActiveFalse(Hotel hotel);

	@Query("SELECT u FROM User u JOIN u.roles r WHERE u.hotel = :hotel AND r.name = :roleName")
	List<User> findByHotelAndRoleName(@Param("hotel") Hotel hotel, @Param("roleName") String roleName);
}
