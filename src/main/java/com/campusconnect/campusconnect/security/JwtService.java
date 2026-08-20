package com.campusconnect.campusconnect.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;

    public JwtService() {

        String secret =
                System.getenv("CAMPUSCONNECT_JWT_SECRET");

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "CAMPUSCONNECT_JWT_SECRET environment variable is not configured"
            );
        }

        SecretKey secretKey =
                new SecretKeySpec(
                        secret.getBytes(StandardCharsets.UTF_8),
                        "HmacSHA256"
                );

        this.jwtEncoder =
                NimbusJwtEncoder
                        .withSecretKey(secretKey)
                        .algorithm(MacAlgorithm.HS256)
                        .build();
    }

    public String generateToken(
            Integer userId,
            String username,
            String role) {

        Instant now = Instant.now();

        JwtClaimsSet claims =
                JwtClaimsSet.builder()
                        .subject(username)
                        .issuedAt(now)
                        .expiresAt(
                                now.plus(
                                        2,
                                        ChronoUnit.HOURS
                                )
                        )
                        .claim(
                                "userId",
                                userId
                        )
                        .claim(
                                "role",
                                role
                        )
                        .build();

        return jwtEncoder.encode(
                JwtEncoderParameters.from(claims)
        ).getTokenValue();
    }
}