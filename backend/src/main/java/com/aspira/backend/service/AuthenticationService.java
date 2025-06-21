package com.aspira.backend.service;

import com.aspira.backend.config.JwtConfig;
import com.aspira.backend.dto.AuthenticationRequest;
import com.aspira.backend.dto.AuthenticationResponse;
import com.aspira.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtConfig jwtConfig;
    private final UserService userService;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwt = jwtConfig.generateToken(userDetails);
        
        User user = userService.getUserByEmail(request.getEmail());
        
        return AuthenticationResponse.builder()
                .token(jwt)
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .city(user.getCity())
                .country(user.getCountry())
                .profileImage(user.getProfileImage())
                .build();
    }
} 