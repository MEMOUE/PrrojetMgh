package com.mghbackend.repository;

import com.mghbackend.entity.Permission;
import com.mghbackend.enums.TypePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

	Optional<Permission> findByName(TypePermission name);

	Set<Permission> findByNameIn(Set<TypePermission> names);

	boolean existsByName(TypePermission name);
}
