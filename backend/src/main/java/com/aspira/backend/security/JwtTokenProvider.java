package com.aspira.backend.security;

import com.aspira.backend.config.JwtConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    @Autowired
    private JwtConfig jwtConfig;

    public String createToken(UserDetails userDetails) {
        return jwtConfig.generateToken(userDetails);
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        return jwtConfig.validateToken(token, userDetails);
    }

    public String extractEmail(String token) {
        return jwtConfig.extractUsername(token);
    }
}
