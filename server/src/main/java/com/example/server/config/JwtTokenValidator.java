// package com.example.server.config;

// import java.io.IOException;
// import java.util.List;

// import javax.crypto.SecretKey;

// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.authority.AuthorityUtils;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.filter.OncePerRequestFilter;

// import io.jsonwebtoken.Claims;
// import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.security.Keys;
// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;

// public class JwtTokenValidator extends OncePerRequestFilter {

//     @Override
//     protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//             throws ServletException, IOException {

//         String jwtHeader = request.getHeader(JwtConstant.JWT_HEADER);
//         if (jwtHeader != null && jwtHeader.startsWith("Bearer ")) {
//             String jwt = jwtHeader.substring(7);
//             try {
//                 // Giải mã và xác thực JWT
//                 SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());
//                 Claims claims = Jwts.parserBuilder()
//                         .setSigningKey(key)
//                         .build()
//                         .parseClaimsJws(jwt)
//                         .getBody();

//                 // Trích xuất thông tin từ claims
//                 String email = String.valueOf(claims.get("email"));
//                 String authoritiesStr = claims.get("authorities", String.class);

//                 // Chuyển đổi authorities thành danh sách GrantedAuthority
//                 List<GrantedAuthority> authorities = AuthorityUtils.commaSeparatedStringToAuthorityList(
//                         authoritiesStr != null ? authoritiesStr : "");

//                 // Tạo đối tượng Authentication và lưu vào SecurityContext
//                 Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, authorities);
//                 SecurityContextHolder.getContext().setAuthentication(authentication);

//             } catch (Exception e) {
//                 // Gửi lỗi 401 nếu token không hợp lệ
//                 response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
//                 return;
//             }
//         }

//         // Tiếp tục xử lý request
//         filterChain.doFilter(request, response);
//     }
// }