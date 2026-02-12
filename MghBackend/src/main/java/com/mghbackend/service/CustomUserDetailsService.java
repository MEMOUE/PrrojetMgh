package com.mghbackend.service;

import com.mghbackend.entity.*;
import com.mghbackend.enums.TypePermission;
import com.mghbackend.repository.HotelRepository;
import com.mghbackend.repository.UserRepository;
import com.mghbackend.security.CustomUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private final HotelRepository hotelRepository;
	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		// Format: "TYPE:email"
		String[] parts = username.split(":", 2);
		if (parts.length != 2) {
			throw new UsernameNotFoundException("Format d'utilisateur invalide");
		}

		String accountType = parts[0];
		String email = parts[1];

		if ("HOTEL".equals(accountType)) {
			return loadHotelByEmail(email);
		} else if ("USER".equals(accountType)) {
			return loadUserByEmail(email);
		} else {
			throw new UsernameNotFoundException("Type de compte inconnu: " + accountType);
		}
	}

	private UserDetails loadHotelByEmail(String email) {
		Hotel hotel = hotelRepository.findByEmailAndActiveTrue(email)
				.orElseThrow(() -> new UsernameNotFoundException("Hôtel non trouvé: " + email));

		Set<GrantedAuthority> authorities = new HashSet<>();
		authorities.add(new SimpleGrantedAuthority("ROLE_HOTEL"));
		authorities.add(new SimpleGrantedAuthority("PERMISSION_ACCES_COMPLET"));

		return new CustomUserPrincipal(
				hotel.getId(),
				hotel.getEmail(),
				hotel.getPassword(),
				"HOTEL",
				hotel.getId(),
				authorities
		);
	}

	private UserDetails loadUserByEmail(String email) {
		User user = userRepository.findByEmailAndActiveTrue(email)
				.orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + email));

		Set<GrantedAuthority> authorities = new HashSet<>();
		authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

		// Ajouter les permissions basées sur les rôles
		for (Role role : user.getRoles()) {
			authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
			for (TypePermission permission : role.getPermissions()) {
				authorities.add(new SimpleGrantedAuthority("PERMISSION_" + permission.name()));
			}
		}

		return new CustomUserPrincipal(
				user.getId(),
				user.getEmail(),
				user.getPassword(),
				"USER",
				user.getHotel().getId(),
				authorities
		);
	}
}
