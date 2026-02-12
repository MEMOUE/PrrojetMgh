package com.mghbackend.controller;

import com.mghbackend.dto.reponse.ApiResponse;
import com.mghbackend.dto.request.LoginRequest;
import com.mghbackend.dto.reponse.LoginResponse;
import com.mghbackend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

	private final AuthService authService;

	@PostMapping("/login")
	public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
		try {
			LoginResponse response = authService.authenticate(request);
			return ResponseEntity.ok(ApiResponse.success("Connexion réussie", response));
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest()
					.body(ApiResponse.error(e.getMessage()));
		}
	}
}
