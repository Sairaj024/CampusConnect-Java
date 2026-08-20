package com.campusconnect.campusconnect.config;

import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    // =====================================================
    // JWT SECRET
    // =====================================================

    private String getJwtSecret() {

        String secret =
                System.getenv("CAMPUSCONNECT_JWT_SECRET");

        if (secret == null || secret.isBlank()) {

            throw new IllegalStateException(
                    "CAMPUSCONNECT_JWT_SECRET environment variable is not configured"
            );
        }

        return secret;
    }


    // =====================================================
    // PASSWORD ENCODER
    // =====================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // =====================================================
    // JWT DECODER
    // =====================================================

    @Bean
    public JwtDecoder jwtDecoder() {

        String secret =
                getJwtSecret();

        SecretKey secretKey =
                new SecretKeySpec(
                        secret.getBytes(
                                StandardCharsets.UTF_8
                        ),
                        "HmacSHA256"
                );

        return NimbusJwtDecoder
                .withSecretKey(secretKey)
                .macAlgorithm(
                        MacAlgorithm.HS256
                )
                .build();
    }


    // =====================================================
    // JWT ROLE CONVERTER
    // =====================================================

    @Bean
    public Converter<
            Jwt,
            ? extends AbstractAuthenticationToken
            > jwtAuthenticationConverter() {

        return jwt -> {

            String role =
                    jwt.getClaimAsString(
                            "role"
                    );

            Collection<GrantedAuthority>
                    authorities =
                    role != null
                            ? List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + role
                                )
                            )
                            : List.of();

            return new JwtAuthenticationToken(
                    jwt,
                    authorities,
                    jwt.getSubject()
            );
        };
    }


    // =====================================================
    // CORS
    // =====================================================

    @Bean
    public CorsConfigurationSource
            corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // -------------------------------------------------
        // FRONTEND URL
        //
        // Local:
        // http://localhost:5173
        //
        // Production:
        // Set CAMPUSCONNECT_FRONTEND_URL
        // -------------------------------------------------

        String frontendUrl =
                System.getenv(
                        "CAMPUSCONNECT_FRONTEND_URL"
                );

        if (frontendUrl == null ||
                frontendUrl.isBlank()) {

            frontendUrl =
                    "http://localhost:5173";
        }

        configuration.setAllowedOrigins(
                List.of(frontendUrl)
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(
                false
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }


    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            // =================================================
            // CSRF
            // =================================================

            .csrf(csrf ->
                    csrf.disable()
            )


            // =================================================
            // CORS
            // =================================================

            .cors(cors ->
                    cors.configurationSource(
                            corsConfigurationSource()
                    )
            )


            // =================================================
            // AUTHORIZATION
            // =================================================

            .authorizeHttpRequests(auth -> auth

                // =============================================
                // PUBLIC ENDPOINTS
                // =============================================

                .requestMatchers(
                        "/api/health",
                        "/api/auth/login",
                        "/api/auth/student-login",
                        "/api/auth/student-register"
                )
                .permitAll()


                // =============================================
                // ADMIN
                // =============================================

                .requestMatchers(
                        "/api/admins/**"
                )
                .hasRole("ADMIN")


                // =============================================
                // STUDENTS
                // =============================================

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/students"
                )
                .hasRole("ADMIN")


                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/students/{id}"
                )
                .hasAnyRole(
                        "ADMIN",
                        "STUDENT"
                )


                .requestMatchers(
                        org.springframework.http.HttpMethod.PUT,
                        "/api/students/{id}"
                )
                .hasAnyRole(
                        "ADMIN",
                        "STUDENT"
                )


                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/students"
                )
                .hasRole("ADMIN")


                .requestMatchers(
                        org.springframework.http.HttpMethod.DELETE,
                        "/api/students/{id}"
                )
                .hasRole("ADMIN")


                // =============================================
                // COMPANIES
                // =============================================

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/companies",
                        "/api/companies/{id}"
                )
                .hasAnyRole(
                        "ADMIN",
                        "STUDENT"
                )


                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/companies"
                )
                .hasRole("ADMIN")


                .requestMatchers(
                        org.springframework.http.HttpMethod.DELETE,
                        "/api/companies/{id}"
                )
                .hasRole("ADMIN")


                // =============================================
                // ANNOUNCEMENTS
                // =============================================

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/announcements",
                        "/api/announcements/{id}"
                )
                .hasAnyRole(
                        "ADMIN",
                        "STUDENT"
                )


                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/announcements"
                )
                .hasRole("ADMIN")


                .requestMatchers(
                        org.springframework.http.HttpMethod.DELETE,
                        "/api/announcements/{id}"
                )
                .hasRole("ADMIN")


                // =============================================
                // APPLICATIONS
                // =============================================

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/applications"
                )
                .hasRole("ADMIN")


                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/applications/my"
                )
                .hasRole("STUDENT")


                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/applications/{id}"
                )
                .hasAnyRole(
                        "ADMIN",
                        "STUDENT"
                )


                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/applications"
                )
                .hasAnyRole(
                        "ADMIN",
                        "STUDENT"
                )


                .requestMatchers(
                        org.springframework.http.HttpMethod.DELETE,
                        "/api/applications/{id}"
                )
                .hasAnyRole(
                        "ADMIN",
                        "STUDENT"
                )


                // =============================================
                // EVERYTHING ELSE
                // =============================================

                .anyRequest()
                .authenticated()
            )


            // =================================================
            // JWT RESOURCE SERVER
            // =================================================

            .oauth2ResourceServer(
                    oauth2 ->
                            oauth2.jwt(
                                    jwt ->
                                            jwt.jwtAuthenticationConverter(
                                                    jwtAuthenticationConverter()
                                            )
                            )
            );

        return http.build();
    }
}