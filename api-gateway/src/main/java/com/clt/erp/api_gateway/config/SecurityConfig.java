package com.clt.erp.api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
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
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
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
                // All other endpoints require authentication
                .anyExchange().authenticated()
            )
            // Configure OAuth2 Resource Server with JWT
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwkSetUri(issuerUri + "/.well-known/jwks.json")
                )
            )
            // Disable CSRF for stateless API (JWT tokens are used)
            .csrf(csrf -> csrf.disable())
            // Return 401 for unauthenticated requests instead of redirecting to login
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((exchange, ex) -> {
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                })
            );

        return http.build();
    }
}
