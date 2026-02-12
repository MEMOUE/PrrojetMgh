package com.mghbackend.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePasswordRequest {
	@NotBlank(message = "L'ancien mot de passe est obligatoire")
	private String oldPassword;

	@NotBlank(message = "Le nouveau mot de passe est obligatoire")
	@Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
	private String newPassword;
}
