package com.clt.erp.auth.config;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;

import com.clt.erp.auth.model.UserInfo;

import lombok.extern.slf4j.Slf4j;

/**
 * Customizes JWT tokens to include OIDC user claims and custom claims.
 * This ensures that access tokens contain user information when OIDC scopes are requested.
 */
@Slf4j
public class OidcTokenCustomizer implements OAuth2TokenCustomizer<JwtEncodingContext> {

    @Override
    public void customize(JwtEncodingContext context) {
        // Only customize access tokens
        if (!OAuth2TokenType.ACCESS_TOKEN.equals(context.getTokenType())) {
            return;
        }

        // Only add claims for authorization code and refresh token grants
        AuthorizationGrantType authorizationGrantType = context.getAuthorizationGrantType();
        if (!AuthorizationGrantType.AUTHORIZATION_CODE.equals(authorizationGrantType) &&
            !AuthorizationGrantType.REFRESH_TOKEN.equals(authorizationGrantType)) {
            return;
        }

        // Get the principal (UserInfo) from authentication
        Authentication authentication = context.getPrincipal();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserInfo)) {
            log.warn("Principal is not UserInfo, skipping token customization");
            return;
        }

        UserInfo userInfo = (UserInfo) authentication.getPrincipal();
        Set<String> requestedScopes = context.getAuthorizedScopes();

        // Add standard OIDC claims when openid scope is requested
        if (requestedScopes.contains(OidcScopes.OPENID)) {
            // Subject claim (sub) - use username (coId::usrId format) for uniqueness
            context.getClaims().claim("sub", userInfo.getUsername());

            // Name claim - when profile scope is requested
            if (requestedScopes.contains(OidcScopes.PROFILE) && userInfo.getUsrNm() != null) {
                context.getClaims().claim("name", userInfo.getUsrNm());
            }

            // Email claim - when email scope is requested
            if (requestedScopes.contains(OidcScopes.EMAIL) && userInfo.getUsrEml() != null) {
                context.getClaims().claim("email", userInfo.getUsrEml());
                // Email verified - set to true (can be enhanced based on business logic)
                context.getClaims().claim("email_verified", true);
            }
        }

        // Add custom claims (always included when user is authenticated)
        if (userInfo.getCoId() != null) {
            context.getClaims().claim("co_id", userInfo.getCoId());
        }
        if (userInfo.getUsrId() != null) {
            context.getClaims().claim("usr_id", userInfo.getUsrId());
        }
        if (userInfo.getRoleId() != null) {
            context.getClaims().claim("role_id", userInfo.getRoleId());
        }
        if (userInfo.getLangVal() != null) {
            context.getClaims().claim("lang_val", userInfo.getLangVal());
        }
        if (userInfo.getSysModVal() != null) {
            context.getClaims().claim("sys_mod_val", userInfo.getSysModVal());
        }
        if (userInfo.getDtFmtVal() != null) {
            context.getClaims().claim("dt_fmt_val", userInfo.getDtFmtVal());
        }
        if (userInfo.getSysColrVal() != null) {
            context.getClaims().claim("sys_colr_val", userInfo.getSysColrVal());
        }
        if (userInfo.getCoTmz() != null) {
            context.getClaims().claim("co_tmz", userInfo.getCoTmz());
        }

        // Add authorities as a claim (optional, useful for authorization)
        if (userInfo.getAuthorities() != null && !userInfo.getAuthorities().isEmpty()) {
            Set<String> authorities = userInfo.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());
            context.getClaims().claim("authorities", authorities);
        }

        log.debug("Customized JWT token for user: {}", userInfo.getUsername());
    }
}
