package com.campusconnect.campusconnect.controller;

import com.campusconnect.campusconnect.dto.LoginRequest;
import com.campusconnect.campusconnect.dto.LoginResponse;
import com.campusconnect.campusconnect.dto.RegisterRequest;
import com.campusconnect.campusconnect.model.Admin;
import com.campusconnect.campusconnect.model.Student;
import com.campusconnect.campusconnect.security.JwtService;
import com.campusconnect.campusconnect.security.SecurityService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SecurityService securityService;
    private final JwtService jwtService;

    public AuthController(
            SecurityService securityService,
            JwtService jwtService) {

        this.securityService = securityService;
        this.jwtService = jwtService;
    }

    // =========================
    // ADMIN LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> adminLogin(
            @RequestBody LoginRequest request) {

        Admin admin = securityService.authenticate(
                request.getUsername(),
                request.getPassword()
        );

        if (admin == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(
                            false,
                            "Invalid username or password",
                            null,
                            null,
                            null
                    ));
        }

        String token = jwtService.generateToken(
                admin.getId(),
                admin.getUsername(),
                "ADMIN"
        );

        return ResponseEntity.ok(
                new LoginResponse(
                        true,
                        "Login successful",
                        admin.getId(),
                        admin.getUsername(),
                        token
                )
        );
    }

    // =========================
    // STUDENT LOGIN
    // =========================

    @PostMapping("/student-login")
    public ResponseEntity<LoginResponse> studentLogin(
            @RequestBody LoginRequest request) {

        Student student =
                securityService.authenticateStudent(
                        request.getUsername(),
                        request.getPassword()
                );

        if (student == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(
                            false,
                            "Invalid email or password",
                            null,
                            null,
                            null
                    ));
        }

        String token = jwtService.generateToken(
                student.getId(),
                student.getEmail(),
                "STUDENT"
        );

        return ResponseEntity.ok(
                new LoginResponse(
                        true,
                        "Student login successful",
                        student.getId(),
                        student.getEmail(),
                        token
                )
        );
    }

    // =========================
    // STUDENT REGISTRATION
    // =========================

    @PostMapping("/student-register")
    public ResponseEntity<LoginResponse> studentRegister(
            @RequestBody RegisterRequest request) {

        if (request.getFullName() == null ||
                request.getFullName().trim().isEmpty()) {

            return ResponseEntity.badRequest().body(
                    new LoginResponse(
                            false,
                            "Full name is required",
                            null,
                            null,
                            null
                    )
            );
        }

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            return ResponseEntity.badRequest().body(
                    new LoginResponse(
                            false,
                            "Email is required",
                            null,
                            null,
                            null
                    )
            );
        }

        if (request.getPassword() == null ||
                request.getPassword().length() < 6) {

            return ResponseEntity.badRequest().body(
                    new LoginResponse(
                            false,
                            "Password must be at least 6 characters",
                            null,
                            null,
                            null
                    )
            );
        }

        Student student = securityService.registerStudent(
                request.getFullName().trim(),
                request.getEmail().trim().toLowerCase(),
                request.getPassword(),
                request.getDepartment(),
                request.getYear()
        );

        if (student == null) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new LoginResponse(
                            false,
                            "An account with this email already exists.",
                            null,
                            null,
                            null
                    ));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new LoginResponse(
                        true,
                        "Student account created successfully",
                        student.getId(),
                        student.getEmail(),
                        null
                )
        );
    }
}
