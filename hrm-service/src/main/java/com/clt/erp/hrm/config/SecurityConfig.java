package com.clt.erp.hrm.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for HRM Service.
 * Configures OAuth2 Resource Server to validate JWT tokens from auth-service.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:http://localhost:8081}")
    private String issuerUri;

    /**
     * JWT decoder that validates tokens from the authorization server.
     * Uses issuer-uri to automatically discover JWK Set URI.
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        // Use issuer-uri to automatically discover JWK Set URI
        // Spring will fetch from issuer-uri/.well-known/openid-configuration
        return NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
    }

    /**
     * Security filter chain that configures OAuth2 resource server.
     * All endpoints require authentication via JWT token.
     * 
     * Note: CORS is handled by the API Gateway, so no CORS configuration is needed here.
     * This service is accessed through the gateway, which adds CORS headers.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.disable()) // Disable CORS - handled by API Gateway
            .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless API (JWT tokens)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // All endpoints require authentication
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder()))
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                })
            );

        return http.build();
    }
}
