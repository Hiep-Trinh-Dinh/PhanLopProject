package com.example.server.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

public class CookieTokenValidator extends OncePerRequestFilter {
    private static final String COOKIE_NAME = "auth_token";
    private final JwtProvider jwtProvider;

    public CookieTokenValidator(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider; // Inject JwtProvider
    }

    @SuppressWarnings("null")
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String jwt = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    System.out.println("Found auth_token: " + jwt); // Debug
                    break;
                }
            }
        }

        if (jwt != null) {
            try {
                if (!jwtProvider.validateToken(jwt)) {
                    throw new Exception("Invalid token");
                }

                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(JwtProvider.SECRET_KEY) // Sử dụng cùng SECRET_KEY
                        .build()
                        .parseClaimsJws(jwt)
                        .getBody();

                String email = claims.getSubject();
                String authoritiesStr = claims.get("authorities", String.class);
                List<GrantedAuthority> authorities = AuthorityUtils.commaSeparatedStringToAuthorityList(
                        authoritiesStr != null ? authoritiesStr : "");

                Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception e) {
                System.out.println("Token validation failed: " + e.getMessage()); // Debug
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}