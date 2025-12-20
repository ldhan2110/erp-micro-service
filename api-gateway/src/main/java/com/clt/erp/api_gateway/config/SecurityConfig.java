package com.clt.erp.api_gateway.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpStatus;

/**
 * Security configuration for API Gateway.
 * Configures OAuth2 Resource Server to validate JWT tokens from auth-service.
 * Uses reactive Spring Security for WebFlux-based Spring Cloud Gateway.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:http://localhost:8081}")
    private String issuerUri;

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        // Use issuer-uri to automatically discover JWK Set URI
        // Spring will fetch from issuer-uri/.well-known/openid-configuration
        return NimbusReactiveJwtDecoder.withIssuerLocation(issuerUri).build();
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        // Configure CORS with explicit configuration
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeExchange(exchanges -> exchanges
                // Public endpoints - OAuth2 and login endpoints
                .pathMatchers(
                    "/oauth2/**",
                    "/login",
                    "/logout",
                    "/.well-known/**",
                    "/css/**",
                    "/js/**",
                    "/images/**",
                    "/webjars/**",
                    "/error"
                ).permitAll()
                // Allow OPTIONS requests for CORS preflight
                .pathMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                // /userinfo requires authentication (Bearer token)
                // All other endpoints require authentication
                .anyExchange().authenticated()
            )
            // Configure OAuth2 Resource Server with JWT
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtDecoder(jwtDecoder()))
            )
            // Disable CSRF for stateless API (JWT tokens are used)
            .csrf(csrf -> csrf.disable())
            // Return 401 for unauthenticated requests instead of redirecting to login
            // CORS headers are automatically added by CorsWebFilter and CORS configuration
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((exchange, ex) -> {
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                })
            );

        return http.build();
    }

    /**
     * CORS configuration source for Spring Security.
     * This is used by the SecurityWebFilterChain.
     */
    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://localhost:4000"
        ));
        corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        corsConfig.setAllowedHeaders(List.of("*"));
        corsConfig.setAllowCredentials(true);
        corsConfig.setExposedHeaders(List.of("Authorization"));
        corsConfig.setMaxAge(3600L); // Cache preflight response for 1 hour
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }

    /**
     * Additional CORS filter with high priority to handle CORS before security.
     * This ensures CORS headers are added even for OPTIONS preflight requests.
     */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsWebFilter corsWebFilter() {
        return new CorsWebFilter(corsConfigurationSource());
    }
}
