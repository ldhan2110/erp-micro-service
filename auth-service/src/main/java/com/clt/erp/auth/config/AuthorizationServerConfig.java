package com.clt.erp.auth.config;

import com.clt.erp.auth.service.KeyPairService;
import com.clt.erp.auth.service.OidcUserInfoService;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.oidc.authentication.OidcUserInfoAuthenticationContext;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.security.KeyPair;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Configuration for OAuth2 Authorization Server.
 * Handles security filter chains, OAuth2 client registration, JWT configuration, and CORS setup.
 */
@Configuration
public class AuthorizationServerConfig {

    private final KeyPairService keyPairService;
    private final OidcUserInfoService oidcUserInfoService;

    @Value("${oauth2.token.access-token-expiration-hours:1}")
    private int accessTokenExpirationHours;

    @Value("${oauth2.token.refresh-token-expiration-days:7}")
    private int refreshTokenExpirationDays;

    @Value("${oauth2.server.issuer-uri:http://localhost:8081}")
    private String issuerUri;

    @Autowired
    public AuthorizationServerConfig(KeyPairService keyPairService, OidcUserInfoService oidcUserInfoService) {
        this.keyPairService = keyPairService;
        this.oidcUserInfoService = oidcUserInfoService;
    }

    // ============================================================================
    // Security Filter Chains
    // ============================================================================

    /**
     * Security filter chain for OAuth2 authorization server endpoints.
     * Handles /oauth2/** endpoints with CORS support and OIDC user info mapping.
     */
    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = new OAuth2AuthorizationServerConfigurer();
        RequestMatcher endpointsMatcher = authorizationServerConfigurer.getEndpointsMatcher();

        http.securityMatcher(endpointsMatcher)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .with(authorizationServerConfigurer, (authorizationServer) -> authorizationServer
                        .oidc(oidc -> oidc
                                .userInfoEndpoint(userInfoEndpoint -> userInfoEndpoint
                                        .userInfoMapper(context -> mapUserInfoFromContext(context))
                                )
                        ))
                .exceptionHandling(exceptions -> exceptions
                        .defaultAuthenticationEntryPointFor(
                                new LoginUrlAuthenticationEntryPoint("/login"),
                                new MediaTypeRequestMatcher(MediaType.TEXT_HTML)
                        )
                )
                .formLogin(form -> form.loginPage("/login"));

        return http.build();
    }

    /**
     * General security filter chain for non-OAuth2 endpoints.
     * Handles login page and static resources.
     */
    @Bean
    @Order(2)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login", "/css/**", "/js/**", "/images/**", "/webjars/**", "/error", "/.well-known/appspecific/**")
                        .permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .permitAll()
                );

        return http.build();
    }

    // ============================================================================
    // OAuth2 Client Configuration
    // ============================================================================

    /**
     * Registered client repository for OAuth2 clients.
     * Configures a public client for the React frontend with PKCE support.
     */
    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient publicClient = createFrontendClient();
        return new InMemoryRegisteredClientRepository(publicClient);
    }

    /**
     * Creates the frontend OAuth2 client configuration.
     */
    private RegisteredClient createFrontendClient() {
        return RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("erp-frontend")
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .redirectUri("http://localhost:3000/callback")
                .postLogoutRedirectUri("http://localhost:3000/")
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope(OidcScopes.EMAIL)
                .clientSettings(ClientSettings.builder()
                        .requireAuthorizationConsent(false)
                        .requireProofKey(true)
                        .build())
                .tokenSettings(TokenSettings.builder()
                        .accessTokenTimeToLive(Duration.ofHours(accessTokenExpirationHours))
                        .refreshTokenTimeToLive(Duration.ofDays(refreshTokenExpirationDays))
                        .build())
                .build();
    }

    // ============================================================================
    // JWT Configuration
    // ============================================================================

    /**
     * JWK source for JWT signing and verification.
     * Uses KeyPairService to get or create a persistent RSA key pair.
     */
    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        KeyPair keyPair = keyPairService.getOrCreateKeyPair();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();

        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(keyPairService.getKeyId())
                .build();

        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }

    /**
     * Authorization server settings with configured issuer URI.
     */
    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer(issuerUri)
                .build();
    }

    /**
     * OAuth2 token customizer to add OIDC user claims to JWT tokens.
     */
    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> oidcTokenCustomizer() {
        return new OidcTokenCustomizer();
    }

    // ============================================================================
    // Password Encoding
    // ============================================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ============================================================================
    // CORS Configuration
    // ============================================================================

    /**
     * CORS configuration to allow requests from frontend applications.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "https://*.erp.com"
        ));
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setAllowCredentials(true);
        corsConfig.setExposedHeaders(Arrays.asList("Authorization"));
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * Maps OIDC user info from authentication context.
     * Tries to extract user info from authorization principal, falls back to JWT claims.
     * 
     * Note: Uses reflection to access Spring Security's internal OidcUserInfoAuthenticationContext
     * API, as the class is not publicly accessible.
     */
    private OidcUserInfo mapUserInfoFromContext(OidcUserInfoAuthenticationContext  context) {
        try {
            // Access getAuthorization() method via reflection
            OAuth2Authorization authorization = context.getAuthorization();
            if (authorization != null) {
                Object principal = authorization.getAttribute("java.security.Principal");
                if (principal instanceof Authentication) {
                    return oidcUserInfoService.loadUserInfo((Authentication) principal);
                }
            }

            // Fallback: extract from JWT token claims
            Authentication authentication = context.getAuthentication();
            JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication.getPrincipal();
            return new OidcUserInfo(jwtAuth.getToken().getClaims());
        } catch (Exception e) {
            throw new RuntimeException("Failed to map user info from context", e);
        }
    }
}
