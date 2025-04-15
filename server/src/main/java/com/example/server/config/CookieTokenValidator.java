package com.example.server.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.data.redis.core.RedisTemplate;
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
    private static final String BLACKLIST_PREFIX = "blacklist_token:";
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;

    public CookieTokenValidator(JwtProvider jwtProvider, RedisTemplate<String, String> redisTemplate) {
        this.jwtProvider = jwtProvider;
        this.redisTemplate = redisTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String jwt = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    logger.info("Found auth_token: " + jwt);
                    break;
                }
            }
        }

        if (jwt != null) {
            try {
                // Kiểm tra danh sách đen
                if (isTokenBlacklisted(jwt)) {
                    logger.warn("Token is blacklisted: " + jwt);
                    SecurityContextHolder.clearContext();
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been blacklisted");
                    return;
                }

                // Kiểm tra tính hợp lệ của token
                if (!jwtProvider.validateToken(jwt)) {
                    logger.warn("Invalid token: " + jwt);
                    SecurityContextHolder.clearContext();
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                    return;
                }

                // Lấy thông tin từ token
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(JwtProvider.SECRET_KEY)
                        .build()
                        .parseClaimsJws(jwt)
                        .getBody();

                String email = claims.getSubject();
                String authoritiesStr = claims.get("authorities", String.class);
                List<GrantedAuthority> authorities = AuthorityUtils.commaSeparatedStringToAuthorityList(
                        authoritiesStr != null ? authoritiesStr : "");

                Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("Authenticated user: " + email);
            } catch (Exception e) {
                logger.error("Token validation failed: " + e.getMessage());
                SecurityContextHolder.clearContext();
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            }
        } else {
            logger.debug("No auth_token cookie found");
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private boolean isTokenBlacklisted(String token) {
        return redisTemplate.opsForValue().get(BLACKLIST_PREFIX + token) != null;
    }
}