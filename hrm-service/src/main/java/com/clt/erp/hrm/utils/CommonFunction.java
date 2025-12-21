package com.clt.erp.hrm.utils;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import lombok.extern.slf4j.Slf4j;

/**
 * Common utility functions for HRM service.
 * Provides methods to extract user information from JWT token.
 */
@Slf4j
public class CommonFunction {

	/**
	 * Gets the user ID from the JWT token.
	 * Extracts from 'usr_id' claim, or parses from 'sub' claim (format: "coId::usrId").
	 * 
	 * @return User ID as string
	 * @throws IllegalStateException if authentication is not available or not a JWT token
	 */
	public static String getUserId() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication instanceof JwtAuthenticationToken jwtAuth) {
			Map<String, Object> claims = jwtAuth.getToken().getClaims();
			
			// Try to get usr_id claim first
			if (claims.containsKey("usr_id") && claims.get("usr_id") != null) {
				return claims.get("usr_id").toString();
			}
			
			// Fallback: parse from sub claim (format: "coId::usrId")
			if (claims.containsKey("sub")) {
				String sub = claims.get("sub").toString();
				if (sub.contains("::")) {
					return sub.split("::")[1];
				}
			}
			
			throw new IllegalStateException("User ID not found in JWT token claims");
		}
		
		throw new IllegalStateException("Authentication is not a JWT token");
	}

	/**
	 * Gets the company ID from the JWT token.
	 * Extracts from 'co_id' claim, or parses from 'sub' claim (format: "coId::usrId").
	 * 
	 * @return Company ID as string
	 * @throws IllegalStateException if authentication is not available or not a JWT token
	 */
	public static String getCompanyId() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication instanceof JwtAuthenticationToken jwtAuth) {
			Map<String, Object> claims = jwtAuth.getToken().getClaims();
			
			// Try to get co_id claim first
			if (claims.containsKey("co_id") && claims.get("co_id") != null) {
				return claims.get("co_id").toString();
			}
			
			// Fallback: parse from sub claim (format: "coId::usrId")
			if (claims.containsKey("sub")) {
				String sub = claims.get("sub").toString();
				if (sub.contains("::")) {
					return sub.split("::")[0];
				}
			}
			
			throw new IllegalStateException("Company ID not found in JWT token claims");
		}
		
		throw new IllegalStateException("Authentication is not a JWT token");
	}

	/**
	 * Gets the username from the JWT token (sub claim).
	 * 
	 * @return Username as string (format: "coId::usrId")
	 * @throws IllegalStateException if authentication is not available or not a JWT token
	 */
	public static String getUsername() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication instanceof JwtAuthenticationToken jwtAuth) {
			Map<String, Object> claims = jwtAuth.getToken().getClaims();
			
			if (claims.containsKey("sub")) {
				return claims.get("sub").toString();
			}
			
			throw new IllegalStateException("Username (sub) not found in JWT token claims");
		}
		
		throw new IllegalStateException("Authentication is not a JWT token");
	}

	/**
	 * Gets the user name (display name) from the JWT token.
	 * 
	 * @return User name as string, or null if not available
	 */
	public static String getName() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication instanceof JwtAuthenticationToken jwtAuth) {
			Map<String, Object> claims = jwtAuth.getToken().getClaims();
			return claims.containsKey("name") ? claims.get("name").toString() : null;
		}
		
		return null;
	}

	/**
	 * Gets the user email from the JWT token.
	 * 
	 * @return User email as string, or null if not available
	 */
	public static String getEmail() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication instanceof JwtAuthenticationToken jwtAuth) {
			Map<String, Object> claims = jwtAuth.getToken().getClaims();
			return claims.containsKey("email") ? claims.get("email").toString() : null;
		}
		
		return null;
	}

	/**
	 * Gets the role ID from the JWT token.
	 * 
	 * @return Role ID as string, or null if not available
	 */
	public static String getRoleId() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication instanceof JwtAuthenticationToken jwtAuth) {
			Map<String, Object> claims = jwtAuth.getToken().getClaims();
			return claims.containsKey("role_id") ? claims.get("role_id").toString() : null;
		}
		
		return null;
	}

	/**
	 * Gets all JWT token claims as a map.
	 * 
	 * @return Map of all claims, or null if authentication is not a JWT token
	 */
	public static Map<String, Object> getClaims() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication instanceof JwtAuthenticationToken jwtAuth) {
			return jwtAuth.getToken().getClaims();
		}
		
		return null;
	}

	/**
	 * Gets a specific claim value from the JWT token.
	 * 
	 * @param claimName The name of the claim to retrieve
	 * @return The claim value, or null if not found
	 */
	public static Object getClaim(String claimName) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication instanceof JwtAuthenticationToken jwtAuth) {
			Map<String, Object> claims = jwtAuth.getToken().getClaims();
			return claims.get(claimName);
		}
		
		return null;
	}

	/**
	 * Checks if the current authentication is a JWT token.
	 * 
	 * @return true if authentication is a JWT token, false otherwise
	 */
	public static boolean isJwtAuthentication() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication instanceof JwtAuthenticationToken;
	}
}
