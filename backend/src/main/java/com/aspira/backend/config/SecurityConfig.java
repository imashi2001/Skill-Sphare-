package com.aspira.backend.config;

import com.aspira.backend.security.JwtAuthenticationFilter;
import com.aspira.backend.security.RestAuthenticationEntryPoint;
import com.aspira.backend.service.CustomOAuth2UserService;
import com.aspira.backend.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthFilter) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Authentication endpoints
                         .requestMatchers("/api/auth/**", "/oauth2/**", "/login/oauth2/**", "/error", "/api/greeting").permitAll()
                       
                         .requestMatchers("/api/users/check-email").permitAll() // Explicitly for GET /api/users/check-email from logs
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll() // Explicitly for POST /api/users (user creation)
                .requestMatchers(HttpMethod.GET, "/api/users/email").permitAll() // If you also have /api/users/email endpoint for GET
                .requestMatchers(HttpMethod.GET, "/api/users/{userId:\\d+}").permitAll() // For public user profiles
                .requestMatchers(HttpMethod.GET, "/api/media/files/**").permitAll() // Allow public access to media files

                        // Interactivity module
                        .requestMatchers("/api/users/**").permitAll()
                        .requestMatchers("/api/posts/**").authenticated()
                        .requestMatchers("/api/media/**").authenticated()
                        .requestMatchers("/api/reactions/**").authenticated()
                        .requestMatchers("/api/saved-posts/**").authenticated()
                        .requestMatchers("/api/comments/**").authenticated()
                        .requestMatchers("/api/notifications/**").authenticated()
                        .requestMatchers("/test-database-connection").authenticated()

                        // Skill share module
                        .requestMatchers("/api/tasks/**").authenticated()
                        // Add your skill share module endpoints here

                        // Group module
                        .requestMatchers("/api/groups/**").authenticated()

                        // Game Hub module
                        // Add your game hub module endpoints here
                        .requestMatchers("/api/users/all").authenticated()
                        .anyRequest().authenticated()
                        )
                        .oauth2Login(oauth2 -> oauth2
                            .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                            )
                            .defaultSuccessUrl("http://localhost:5173/home", true)
                        )
                .exceptionHandling(exceptions -> exceptions
                    .authenticationEntryPoint(restAuthenticationEntryPoint)
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

     @Bean
    public UserDetailsService userDetailsService() {
        return customUserDetailsService;
    }
   

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}


