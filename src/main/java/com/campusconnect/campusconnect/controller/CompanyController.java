package com.campusconnect.campusconnect.controller;

import com.campusconnect.campusconnect.dto.CompanyRequest;
import com.campusconnect.campusconnect.dto.CompanyResponse;
import com.campusconnect.campusconnect.mapper.CompanyMapper;
import com.campusconnect.campusconnect.model.Company;
import com.campusconnect.campusconnect.service.CompanyService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;
    private final CompanyMapper companyMapper;

    public CompanyController(
            CompanyService companyService,
            CompanyMapper companyMapper) {

        this.companyService = companyService;
        this.companyMapper = companyMapper;
    }

    // =====================================================
    // GET ALL COMPANIES
    //
    // STUDENTS + ADMIN
    // =====================================================

    @GetMapping
    public List<CompanyResponse> getAllCompanies() {

        return companyService.getAllCompanies()
                .stream()
                .map(companyMapper::toResponse)
                .toList();
    }

    // =====================================================
    // GET COMPANY BY ID
    //
    // STUDENTS + ADMIN
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(
            @PathVariable Integer id) {

        Company company =
                companyService.getCompanyById(id);

        if (company == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                companyMapper.toResponse(company)
        );
    }

    // =====================================================
    // CREATE COMPANY
    //
    // ADMIN ONLY
    // =====================================================

    @PostMapping
    public ResponseEntity<CompanyResponse> createCompany(
            @Valid @RequestBody CompanyRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        // -------------------------------------------------
        // CHECK ROLE
        // -------------------------------------------------

        String role =
                jwt.getClaimAsString("role");

        if (!"ADMIN".equals(role)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        // -------------------------------------------------
        // CREATE COMPANY
        // -------------------------------------------------

        Company company =
                new Company();

        company.setCompanyName(
                request.getCompanyName()
        );

        company.setRole(
                request.getRole()
        );

        company.setPackageName(
                request.getPackageName()
        );

        company.setLocation(
                request.getLocation()
        );

        company.setEligibility(
                request.getEligibility()
        );

        // -------------------------------------------------
        // APPLICATION DEADLINE
        // -------------------------------------------------

        if (request.getApplicationDeadline() != null &&
                !request.getApplicationDeadline().isBlank()) {

            company.setApplicationDeadline(
                    LocalDateTime.parse(
                            request.getApplicationDeadline()
                    )
            );
        }

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        Company savedCompany =
                companyService.saveCompany(
                        company
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        companyMapper.toResponse(
                                savedCompany
                        )
                );
    }

    // =====================================================
    // DELETE COMPANY
    //
    // ADMIN ONLY
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt) {

        // -------------------------------------------------
        // CHECK ROLE
        // -------------------------------------------------

        String role =
                jwt.getClaimAsString("role");

        if (!"ADMIN".equals(role)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        // -------------------------------------------------
        // CHECK COMPANY EXISTS
        // -------------------------------------------------

        Company company =
                companyService.getCompanyById(id);

        if (company == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        // -------------------------------------------------
        // DELETE
        // -------------------------------------------------

        companyService.deleteCompany(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}