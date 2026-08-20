package com.campusconnect.campusconnect.controller;

import com.campusconnect.campusconnect.dto.StudentRequest;
import com.campusconnect.campusconnect.dto.StudentResponse;
import com.campusconnect.campusconnect.dto.StudentUpdateRequest;
import com.campusconnect.campusconnect.mapper.StudentMapper;
import com.campusconnect.campusconnect.model.Student;
import com.campusconnect.campusconnect.service.StudentService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    private final StudentMapper studentMapper;

    public StudentController(
            StudentService studentService,
            StudentMapper studentMapper) {

        this.studentService = studentService;
        this.studentMapper = studentMapper;
    }

    // =====================================================
    // GET ALL STUDENTS
    //
    // ADMIN ONLY
    // =====================================================

    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAllStudents(
            @AuthenticationPrincipal Jwt jwt) {

        String role =
                jwt.getClaimAsString("role");

        if (!"ADMIN".equals(role)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        List<StudentResponse> students =
                studentService.getAllStudents()
                        .stream()
                        .map(studentMapper::toResponse)
                        .toList();

        return ResponseEntity.ok(students);
    }

    // =====================================================
    // GET STUDENT BY ID
    //
    // ADMIN:
    // Can view any student
    //
    // STUDENT:
    // Can view only their own profile
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt) {

        String role =
                jwt.getClaimAsString("role");

        // -------------------------------------------------
        // ADMIN
        // -------------------------------------------------

        if ("ADMIN".equals(role)) {

            Student student =
                    studentService.getStudentById(id);

            if (student == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity.ok(
                    studentMapper.toResponse(student)
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
                    !userId.equals(id)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .build();
            }

            Student student =
                    studentService.getStudentById(id);

            if (student == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity.ok(
                    studentMapper.toResponse(student)
            );
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .build();
    }

    // =====================================================
    // CREATE STUDENT
    //
    // Kept available for registration.
    //
    // IMPORTANT:
    // If this endpoint is only used by ADMIN in your
    // current application, we can make it ADMIN-only later.
    // =====================================================

    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(
            @Valid @RequestBody StudentRequest request) {

        Student student =
                new Student();

        student.setFullName(
                request.getFullName()
        );

        student.setEmail(
                request.getEmail()
        );

        student.setPassword(
                request.getPassword()
        );

        student.setDepartment(
                request.getDepartment()
        );

        student.setYear(
                request.getYear()
        );

        Student savedStudent =
                studentService.saveStudent(
                        student
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        studentMapper.toResponse(
                                savedStudent
                        )
                );
    }

    // =====================================================
    // UPDATE STUDENT PROFILE
    //
    // ADMIN:
    // Can update any student
    //
    // STUDENT:
    // Can update only their own profile
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable Integer id,
            @Valid @RequestBody StudentUpdateRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        String role =
                jwt.getClaimAsString("role");

        // -------------------------------------------------
        // ADMIN
        // -------------------------------------------------

        if ("ADMIN".equals(role)) {

            Student updatedStudent =
                    studentService.updateStudent(
                            id,
                            request.getFullName(),
                            request.getEmail(),
                            request.getDepartment(),
                            request.getYear()
                    );

            if (updatedStudent == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity.ok(
                    studentMapper.toResponse(
                            updatedStudent
                    )
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

            // Student must have valid JWT user ID
            if (userId == null) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .build();
            }

            // Student can ONLY update their own profile
            if (!userId.equals(id)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .build();
            }

            Student updatedStudent =
                    studentService.updateStudentProfile(
                            jwt.getSubject(),
                            request.getFullName(),
                            request.getEmail(),
                            request.getDepartment(),
                            request.getYear()
                    );

            if (updatedStudent == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity.ok(
                    studentMapper.toResponse(
                            updatedStudent
                    )
            );
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .build();
    }

    // =====================================================
    // DELETE STUDENT
    //
    // ADMIN ONLY
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(
            @PathVariable Integer id,
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
        // CHECK STUDENT EXISTS
        // -------------------------------------------------

        Student student =
                studentService.getStudentById(id);

        if (student == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        // -------------------------------------------------
        // DELETE
        // -------------------------------------------------

        studentService.deleteStudent(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}