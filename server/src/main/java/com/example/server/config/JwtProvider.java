package com.example.server.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(Authentication auth) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("email", auth.getName())
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            // Bỏ qua phần "Bearer " nếu có
            String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
            
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(jwt);
                
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            // Invalid signature/claims
            System.err.println("Invalid JWT: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            // Token hết hạn
            System.err.println("Expired JWT: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            // Token không đúng định dạng
            System.err.println("Unsupported JWT: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            // Token rỗng/null
            System.err.println("JWT claims string is empty: " + e.getMessage());
        }
        return false;
    }

    public String getEmailFromToken(String token) {
        try {
            String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
            
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(jwt)
                .getBody();
                
            return claims.get("email", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("Error parsing JWT: " + e.getMessage());
            throw new JwtException("Invalid token", e);
        }
    }
}