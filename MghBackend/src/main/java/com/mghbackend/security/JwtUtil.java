package com.mghbackend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

	@Value("${jwt.secret:mySecretKeyForMghBackendApplicationVerySecureAndLong}")
	private String secret;

	@Value("${jwt.expiration:86400000}") // 24 heures par défaut
	private long expiration;

	private SecretKey getSigningKey() {
		return Keys.hmacShaKeyFor(secret.getBytes());
	}

	public String generateToken(String email, String accountType, Long id) {
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + expiration);

		return Jwts.builder()
				.setSubject(email)
				.claim("accountType", accountType)
				.claim("id", id)
				.setIssuedAt(now)
				.setExpiration(expiryDate)
				.signWith(getSigningKey(), SignatureAlgorithm.HS256)
				.compact();
	}

	private Claims extractAllClaims(String token) {
		return Jwts
				.parserBuilder()
				.setSigningKey(getSigningKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
	}

	public String getEmailFromToken(String token) {
		return extractAllClaims(token).getSubject();
	}

	public String getAccountTypeFromToken(String token) {
		return extractAllClaims(token).get("accountType", String.class);
	}

	public Long getIdFromToken(String token) {
		return extractAllClaims(token).get("id", Long.class);
	}

	public boolean isTokenValid(String token) {
		try {
			extractAllClaims(token);
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}

	public boolean isTokenExpired(String token) {
		try {
			return extractAllClaims(token).getExpiration().before(new Date());
		} catch (JwtException | IllegalArgumentException e) {
			return true;
		}
	}
}
