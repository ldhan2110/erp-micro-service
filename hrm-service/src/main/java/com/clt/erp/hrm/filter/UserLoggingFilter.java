package com.clt.erp.hrm.filter;

import com.clt.erp.hrm.utils.CommonFunction;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter to log user information for all API requests.
 * Extracts user details from JWT token and logs them.
 * This filter runs after authentication, so the SecurityContext is available.
 */
@Slf4j
@Component
@Order(1)
public class UserLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        // Only log for authenticated requests (skip OPTIONS preflight)
        if (!"OPTIONS".equalsIgnoreCase(request.getMethod())) {
            logCurrentUser(request);
        }
        
        filterChain.doFilter(request, response);
    }

    /**
     * Extracts and logs the current user information from the JWT token.
     * Uses CommonFunction utility to extract user details.
     */
    private void logCurrentUser(HttpServletRequest request) {
        try {
            if (CommonFunction.isJwtAuthentication()) {
                String username = CommonFunction.getUsername();
                String name = CommonFunction.getName();
                String email = CommonFunction.getEmail();
                String userId = CommonFunction.getUserId();
                String companyId = CommonFunction.getCompanyId();
                String roleId = CommonFunction.getRoleId();
                
                log.info("=== API Call by User ===");
                log.info("Request: {} {}", request.getMethod(), request.getRequestURI());
                log.info("Username (sub): {}", username);
                log.info("Name: {}", name != null ? name : "N/A");
                log.info("Email: {}", email != null ? email : "N/A");
                log.info("User ID: {}", userId);
                log.info("Company ID: {}", companyId);
                log.info("Role ID: {}", roleId != null ? roleId : "N/A");
                log.info("========================");
            } else {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated()) {
                    log.debug("API Call - Authentication type: {}, Principal: {}", 
                        authentication.getClass().getSimpleName(), 
                        authentication.getPrincipal());
                }
            }
        } catch (Exception e) {
            log.error("Error extracting user information from JWT token", e);
        }
    }
}
