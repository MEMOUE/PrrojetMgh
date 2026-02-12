package com.mghbackend.dto.reponse;

import com.mghbackend.enums.TypePermission;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
	private String token;
	private String type; // "Bearer"
	private Long id;
	private String email;
	private String name;
	private String firstName; // pour les employés uniquement
	private String lastName; // pour les employés uniquement
	private String accountType; // "HOTEL" ou "USER"
	private Long hotelId;
	private String hotelName;
	private Set<String> roles;
	private Set<TypePermission> permissions;
}
