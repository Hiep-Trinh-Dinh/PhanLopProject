package com.example.server.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtProvider {
    static final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final long EXPIRATION_TIME = 604800000; // 7 ngày (ms)

    public String generateToken(Authentication authentication) {
        String email = authentication.getName();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);
        String sessionId = UUID.randomUUID().toString(); // Tạo session ID duy nhất

        return Jwts.builder()
                .setSubject(email)
                .claim("email", email)
                .claim("authorities", authentication.getAuthorities().toString())
                .claim("sessionId", sessionId) // Thêm session ID để đảm bảo tính duy nhất
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(Authentication authentication, Map<String, Object> additionalClaims) {
        String email = authentication.getName();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);
        String sessionId = UUID.randomUUID().toString(); // Tạo session ID duy nhất

        var tokenBuilder = Jwts.builder()
                .setSubject(email)
                .claim("email", email)
                .claim("authorities", authentication.getAuthorities().toString())
                .claim("sessionId", sessionId) // Thêm session ID để đảm bảo tính duy nhất
                .setIssuedAt(now)
                .setExpiration(expiryDate);
                
        // Add any additional claims (like userId)
        if (additionalClaims != null) {
            additionalClaims.forEach(tokenBuilder::claim);
        }
                
        return tokenBuilder.signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            System.out.println("Token validation error: " + e.getMessage());
            return false;
        }
    }
    
    public String getJwtFromRequest(HttpServletRequest request) {
        // Lấy token từ cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("auth_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        // Nếu không có trong cookie, thử lấy từ header
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }
    
    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
            
            // If userId is stored directly in the token, try to retrieve it
            if (claims.get("userId") != null) {
                return Long.valueOf(claims.get("userId").toString());
            }
            
            // If userId is not available, return null to indicate the token doesn't contain userId
            return null;
        } catch (Exception e) {
            System.out.println("Error extracting userId from token: " + e.getMessage());
            return null;
        }
    }
    
    public Long getUserIdFromJwtToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
            
            // If userId is stored directly in the token, try to retrieve it
            if (claims.get("userId") != null) {
                return Long.valueOf(claims.get("userId").toString());
            }
            
            // If userId is not available, return null to indicate the token doesn't contain userId
            return null;
        } catch (Exception e) {
            System.out.println("Error extracting userId from token: " + e.getMessage());
            return null;
        }
    }
}