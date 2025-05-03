package com.example.server.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class AppConfig {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    // private static final List<String> ALLOWED_ORIGINS = Arrays.asList(
    //     "http://localhost:3000",
    //     "http://127.0.0.1:3000"
    // );

    // private static final List<String> ALLOWED_METHODS = Arrays.asList(
    //     "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
    // );

    // private static final List<String> ALLOWED_HEADERS = Arrays.asList(
    //     "Content-Type",
    //     "Set-Cookie",
    //     "X-Requested-With",
    //     "Accept",
    //     "Origin",
    //     "Access-Control-Request-Method",
    //     "Access-Control-Request-Headers",
    //     "Cache-Control",
    //     "Authorization"
    // );

    // private static final List<String> EXPOSED_HEADERS = Arrays.asList(
    //     "Set-Cookie",
    //     "X-Custom-Header"
    // );

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtProvider jwtProvider) throws Exception {
        http
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/{id:\\d+}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/groups").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/groups/{id:\\d+}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/groups/{id:\\d+}/members").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers("/api/friendship/**").authenticated()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .addFilterBefore(new CookieTokenValidator(jwtProvider, redisTemplate), BasicAuthenticationFilter.class)
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable());

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Cho phép tất cả origins trong môi trường phát triển
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://127.0.0.1:3000"));
        
        // Cho phép tất cả methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // Cho phép tất cả headers
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "expires", "Set-Cookie", "Cookie", "X-Requested-With"));
        
        // Expose header Set-Cookie
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie"));
        
        // Cho phép credentials (cookies)
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}