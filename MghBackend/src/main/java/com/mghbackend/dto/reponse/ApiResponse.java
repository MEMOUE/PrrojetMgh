package com.mghbackend.dto.reponse;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
	private boolean success;
	private String message;
	private T data;

	// Réponse succès avec data et message par défaut
	public static <T> ApiResponse<T> success(T data) {
		return new ApiResponse<>(true, "Opération réussie", data);
	}

	// Réponse succès avec message personnalisé
	public static <T> ApiResponse<T> success(String message, T data) {
		return new ApiResponse<>(true, message, data);
	}

	// Réponse erreur avec message uniquement
	public static <T> ApiResponse<T> error(String message) {
		return new ApiResponse<>(false, message, null);
	}

	// ✅ Réponse erreur avec message et data (la méthode manquante)
	public static <T> ApiResponse<T> error(String message, T data) {
		return new ApiResponse<>(false, message, data);
	}
}
