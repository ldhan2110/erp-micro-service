package com.clt.erp.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // OAuth2 endpoints to auth-service (using service discovery)
                .route("oauth2-authorize", r -> r
                        .path("/oauth2/authorize")
                        .uri("lb://auth-service"))
                
                .route("oauth2-token", r -> r
                        .path("/oauth2/token")
                        .uri("lb://auth-service"))
                
                .route("oauth2-login", r -> r
                        .path("/login")
                        .uri("lb://auth-service"))
                
                .route("oauth2-logout", r -> r
                        .path("/logout")
                        .uri("lb://auth-service"))
                
                .route("oauth2-jwks", r -> r
                        .path("/.well-known/jwks.json")
                        .uri("lb://auth-service"))
                
                .route("oauth2-oidc", r -> r
                        .path("/.well-known/openid-configuration")
                        .uri("lb://auth-service"))
                
                // HRM Service - forwards Authorization header
                .route("hrm-service", r -> r
                        .path("/api/hrm/**")
                        .filters(f -> f
                                .rewritePath("/api/hrm/(?<segment>.*)", "/${segment}")
                                // Token is automatically forwarded in Authorization header
                        )
                        .uri("lb://hrm-service")) // Using service discovery
                
                // Other services follow the same pattern
                .route("other-service", r -> r
                        .path("/api/other/**")
                        .filters(f -> f.rewritePath("/api/other/(?<segment>.*)", "/${segment}"))
                        .uri("lb://other-service"))
                
                .build();
    }
}
