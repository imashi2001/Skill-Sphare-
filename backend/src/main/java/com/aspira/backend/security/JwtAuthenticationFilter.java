package com.aspira.backend.security;

import com.aspira.backend.config.JwtConfig;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtConfig jwtConfig;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        System.out.println("JwtAuthenticationFilter: Processing request for URI: " + request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("JwtAuthenticationFilter: No JWT token found in Authorization header or header doesn't start with Bearer. Passing to next filter.");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        System.out.println("JwtAuthenticationFilter: Extracted JWT: " + jwt);
        try {
            userEmail = jwtConfig.extractUsername(jwt);
            System.out.println("JwtAuthenticationFilter: Extracted userEmail: " + userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                System.out.println("JwtAuthenticationFilter: User email extracted and no existing authentication in context.");
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                System.out.println("JwtAuthenticationFilter: Loaded UserDetails for user: " + userDetails.getUsername());
                
                if (jwtConfig.validateToken(jwt, userDetails)) {
                    System.out.println("JwtAuthenticationFilter: JWT token is valid.");
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("JwtAuthenticationFilter: Authentication set in SecurityContext.");
                } else {
                    System.out.println("JwtAuthenticationFilter: JWT token validation failed.");
                }
            } else {
                System.out.println("JwtAuthenticationFilter: User email is null or authentication already exists in context.");
            }
        } catch (Exception e) {
            System.err.println("JwtAuthenticationFilter: Error during JWT processing: " + e.getMessage());
            // Optionally, log the stack trace for more details: e.printStackTrace();
        }
        
        filterChain.doFilter(request, response);
        System.out.println("JwtAuthenticationFilter: Finished processing request for URI: " + request.getRequestURI());
    }
} 