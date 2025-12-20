package com.clt.erp.auth.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.stereotype.Service;

import com.clt.erp.auth.model.UserInfo;

import lombok.extern.slf4j.Slf4j;

/**
 * Service to provide OIDC UserInfo endpoint implementation.
 * This service extracts user information from the authenticated principal
 * and returns it in OIDC-compliant format.
 * 
 * This service will be used by the userInfoMapper in AuthorizationServerConfig.
 */
@Slf4j
@Service
public class OidcUserInfoService {

    /**
     * Builds OidcUserInfo from the authenticated principal.
     * Includes both standard OIDC claims and custom claims.
     * 
     * @param authentication The authentication object containing UserInfo as principal
     * @return OidcUserInfo with all user claims
     */
    public OidcUserInfo loadUserInfo(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserInfo)) {
            log.warn("Unable to extract UserInfo from principal");
            throw new IllegalArgumentException("Unable to extract user information from authentication");
        }

        UserInfo userInfo = (UserInfo) authentication.getPrincipal();
        return buildUserInfo(userInfo);
    }

    /**
     * Builds OidcUserInfo from UserInfo model.
     * Includes both standard OIDC claims and custom claims.
     */
    private OidcUserInfo buildUserInfo(UserInfo userInfo) {
        Map<String, Object> claims = new HashMap<>();

        // Standard OIDC claims
        claims.put("sub", userInfo.getUsername()); // Subject identifier

        if (userInfo.getUsrNm() != null) {
            claims.put("name", userInfo.getUsrNm());
        }

        if (userInfo.getUsrEml() != null) {
            claims.put("email", userInfo.getUsrEml());
            claims.put("email_verified", true); // Can be enhanced based on business logic
        }

        // Custom claims
        if (userInfo.getCoId() != null) {
            claims.put("co_id", userInfo.getCoId());
        }
        if (userInfo.getUsrId() != null) {
            claims.put("usr_id", userInfo.getUsrId());
        }
        if (userInfo.getRoleId() != null) {
            claims.put("role_id", userInfo.getRoleId());
        }
        if (userInfo.getLangVal() != null) {
            claims.put("lang_val", userInfo.getLangVal());
        }
        if (userInfo.getSysModVal() != null) {
            claims.put("sys_mod_val", userInfo.getSysModVal());
        }
        if (userInfo.getDtFmtVal() != null) {
            claims.put("dt_fmt_val", userInfo.getDtFmtVal());
        }
        if (userInfo.getSysColrVal() != null) {
            claims.put("sys_colr_val", userInfo.getSysColrVal());
        }
        if (userInfo.getCoTmz() != null) {
            claims.put("co_tmz", userInfo.getCoTmz());
        }

        log.debug("Built OidcUserInfo for user: {}", userInfo.getUsername());
        return new OidcUserInfo(claims);
    }
}
