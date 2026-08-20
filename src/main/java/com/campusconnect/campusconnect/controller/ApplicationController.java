package com.campusconnect.campusconnect.controller;

import com.campusconnect.campusconnect.model.Application;
import com.campusconnect.campusconnect.service.ApplicationService;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(
            ApplicationService applicationService) {

        this.applicationService = applicationService;
    }


    // =====================================================
    // GET ALL APPLICATIONS
    // ADMIN ONLY
    // =====================================================

    // =====================================================
// GET ALL APPLICATIONS
//
// ADMIN ONLY
// =====================================================

        @GetMapping
        public ResponseEntity<List<Application>> getAllApplications(
                @AuthenticationPrincipal Jwt jwt) {

        String role =
                jwt.getClaimAsString("role");

    // -------------------------------------------------
    // ADMIN ONLY
    // -------------------------------------------------

        if (!"ADMIN".equals(role)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .build();
        }

    // -------------------------------------------------
    // RETURN ALL APPLICATIONS
    // -------------------------------------------------

        return ResponseEntity.ok(
                applicationService.getAllApplications()
        );
}


    // =====================================================
    // GET MY APPLICATIONS
    // STUDENT ONLY
    // =====================================================

    @GetMapping("/my")
    public ResponseEntity<List<Application>> getMyApplications(
            @AuthenticationPrincipal Jwt jwt) {

        String role =
                jwt.getClaimAsString("role");

        if (!"STUDENT".equals(role)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        Integer userId =
                jwt.getClaim("userId") != null
                        ? ((Number) jwt.getClaim("userId"))
                                .intValue()
                        : null;

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        return ResponseEntity.ok(
                applicationService
                        .getApplicationsByStudentId(userId)
        );
    }


    // =====================================================
    // GET APPLICATION BY ID
    //
    // ADMIN:
    // Can access any application
    //
    // STUDENT:
    // Can access only their own application
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt) {

        Application application =
                applicationService
                        .getApplicationById(id);

        if (application == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        String role =
                jwt.getClaimAsString("role");


        // -------------------------------------------------
        // ADMIN
        // -------------------------------------------------

        if ("ADMIN".equals(role)) {

            return ResponseEntity.ok(
                    application
            );
        }


        // -------------------------------------------------
        // STUDENT
        // -------------------------------------------------

        if ("STUDENT".equals(role)) {

            Integer userId =
                    jwt.getClaim("userId") != null
                            ? ((Number) jwt.getClaim("userId"))
                                    .intValue()
                            : null;

            if (userId == null ||
                    !userId.equals(
                            application.getStudentId()
                    )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .build();
            }

            return ResponseEntity.ok(
                    application
            );
        }


        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .build();
    }


    // =====================================================
    // CREATE APPLICATION
    //
    // STUDENT:
    // Can apply for themselves
    //
    // ADMIN:
    // Currently not allowed to create applications
    //
    // Request:
    // multipart/form-data
    //
    // companyId = Company ID
    // resume    = PDF resume
    // =====================================================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Application> createApplication(
            @RequestParam Integer companyId,
            @RequestPart("resume") MultipartFile resume,
            @AuthenticationPrincipal Jwt jwt) {

        String role =
                jwt.getClaimAsString("role");


        // -------------------------------------------------
        // ALLOWED ROLES
        // -------------------------------------------------

        if (!"ADMIN".equals(role) &&
                !"STUDENT".equals(role)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        Application application =
                new Application();

        application.setCompanyId(
                companyId
        );


        // -------------------------------------------------
        // STUDENT
        //
        // Never trust studentId from frontend.
        // Always use JWT.
        // -------------------------------------------------

        if ("STUDENT".equals(role)) {

            Integer userId =
                    jwt.getClaim("userId") != null
                            ? ((Number) jwt.getClaim("userId"))
                                    .intValue()
                            : null;

            if (userId == null) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .build();
            }

            application.setStudentId(
                    userId
            );
        }


        // -------------------------------------------------
        // ADMIN
        //
        // Admin creation is intentionally disabled.
        // -------------------------------------------------

        if ("ADMIN".equals(role)) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .build();
        }


        // -------------------------------------------------
        // SAVE APPLICATION
        // -------------------------------------------------

        Application savedApplication =
                applicationService.saveApplication(
                        application,
                        resume
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedApplication);
    }


    // =====================================================
    // DOWNLOAD RESUME
    //
    // ADMIN:
    // Can download any student's resume
    //
    // STUDENT:
    // Can download only their own resume
    // =====================================================

    @GetMapping("/{id}/resume")
    public ResponseEntity<byte[]> downloadResume(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt) {

        Application application =
                applicationService
                        .getApplicationById(id);

        if (application == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        String role =
                jwt.getClaimAsString("role");


        // -------------------------------------------------
        // ADMIN
        // -------------------------------------------------

        if ("ADMIN".equals(role)) {

            return buildResumeResponse(
                    application
            );
        }


        // -------------------------------------------------
        // STUDENT
        // -------------------------------------------------

        if ("STUDENT".equals(role)) {

            Integer userId =
                    jwt.getClaim("userId") != null
                            ? ((Number) jwt.getClaim("userId"))
                                    .intValue()
                            : null;

            if (userId == null ||
                    !userId.equals(
                            application.getStudentId()
                    )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .build();
            }

            return buildResumeResponse(
                    application
            );
        }


        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .build();
    }


 // =====================================================
// EXPORT APPLICATIONS ZIP
//
// ADMIN ONLY
//
// Without companyId:
// /api/applications/export
//
// Exports ALL applications.
//
// With companyId:
// /api/applications/export?companyId=6
//
// Exports applications for that company only.
//
// ZIP contains:
// - Excel file with all applicant details
// - Resumes folder containing actual PDF resumes
// =====================================================

@GetMapping("/export")
public ResponseEntity<byte[]> exportApplications(
        @RequestParam(
                required = false
        ) Integer companyId,
        @AuthenticationPrincipal Jwt jwt) {

    String role =
            jwt.getClaimAsString("role");

    // -------------------------------------------------
    // ADMIN ONLY
    // -------------------------------------------------

    if (!"ADMIN".equals(role)) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .build();
    }

    try {

        // -------------------------------------------------
        // GENERATE ZIP
        // -------------------------------------------------

        byte[] zipData =
                applicationService
                        .generateApplicationsZip(
                                companyId
                        );

        // -------------------------------------------------
        // RESPONSE HEADERS
        // -------------------------------------------------

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_OCTET_STREAM
        );

        headers.setContentLength(
                zipData.length
        );

        // -------------------------------------------------
        // FILE NAME
        // -------------------------------------------------

        String filename;

        if (companyId != null) {

            filename =
                    "company-" +
                    companyId +
                    "-applications.zip";

        } else {

            filename =
                    "campusconnect-applications.zip";
        }

        // -------------------------------------------------
        // FORCE DOWNLOAD
        // -------------------------------------------------

        headers.setContentDisposition(
                ContentDisposition
                        .attachment()
                        .filename(filename)
                        .build()
        );

        // -------------------------------------------------
        // RETURN ZIP
        // -------------------------------------------------

        return new ResponseEntity<>(
                zipData,
                headers,
                HttpStatus.OK
        );

    } catch (Exception e) {

        // -------------------------------------------------
        // PRINT ACTUAL ERROR
        // -------------------------------------------------

        e.printStackTrace();

        return ResponseEntity
                .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                )
                .build();
    }
}
// =====================================================
// BUILD RESUME DOWNLOAD RESPONSE
// =====================================================

private ResponseEntity<byte[]> buildResumeResponse(
        Application application) {

    byte[] resumeData =
            application.getResumeData();

    // -------------------------------------------------
    // NO RESUME
    // -------------------------------------------------

    if (resumeData == null ||
            resumeData.length == 0) {

        return ResponseEntity
                .notFound()
                .build();
    }

    // -------------------------------------------------
    // FILE NAME
    // -------------------------------------------------

    String filename =
            application.getResumeOriginalName();

    if (filename == null ||
            filename.isBlank()) {

        filename = "resume.pdf";
    }

    // -------------------------------------------------
    // RESPONSE HEADERS
    // -------------------------------------------------

    HttpHeaders headers =
            new HttpHeaders();

    headers.setContentType(
            MediaType.APPLICATION_PDF
    );

    headers.setContentLength(
            resumeData.length
    );

    headers.setContentDisposition(
            ContentDisposition
                    .attachment()
                    .filename(filename)
                    .build()
    );

    // -------------------------------------------------
    // RETURN PDF
    // -------------------------------------------------

    return new ResponseEntity<>(
            resumeData,
            headers,
            HttpStatus.OK
    );
}
}