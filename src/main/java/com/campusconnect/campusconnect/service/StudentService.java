package com.campusconnect.campusconnect.service;

import com.campusconnect.campusconnect.model.Student;
import com.campusconnect.campusconnect.repository.StudentRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentService(
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {

        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // GET ALL STUDENTS
    // =========================

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // =========================
    // GET STUDENT BY ID
    // =========================

    public Student getStudentById(Integer id) {
        return studentRepository
                .findById(id)
                .orElse(null);
    }

    // =========================
    // GET STUDENT BY EMAIL
    // =========================

    public Student getStudentByEmail(String email) {

        return studentRepository
                .findByEmail(email)
                .orElse(null);
    }

    // =========================
    // CREATE STUDENT
    // =========================

    public Student saveStudent(Student student) {

        // Prevent duplicate email addresses
        if (student.getId() == null &&
            studentRepository
                .findByEmail(student.getEmail())
                .isPresent()) {

            throw new IllegalStateException(
                    "A student with this email already exists"
            );
        }

        // Set creation timestamp
        if (student.getCreatedAt() == null) {

            student.setCreatedAt(
                    LocalDateTime.now()
            );
        }

        // Hash password before saving
        if (student.getPassword() != null &&
            !student.getPassword().startsWith("$2")) {

            student.setPassword(
                    passwordEncoder.encode(
                            student.getPassword()
                    )
            );
        }

        return studentRepository.save(student);
    }

    // =========================
    // UPDATE STUDENT PROFILE
    // =========================

    public Student updateStudentProfile(
            String currentEmail,
            String fullName,
            String newEmail,
            String department,
            String year) {

        Student student = studentRepository
                .findByEmail(currentEmail)
                .orElse(null);

        if (student == null) {
            return null;
        }

        // Check if the new email is already used
        // by another student.
        if (!student.getEmail().equalsIgnoreCase(newEmail)) {

            Student existingStudent =
                    studentRepository
                            .findByEmail(newEmail)
                            .orElse(null);

            if (existingStudent != null &&
                !existingStudent
                        .getId()
                        .equals(student.getId())) {

                throw new IllegalStateException(
                        "A student with this email already exists"
                );
            }
        }

        // Update profile information
        student.setFullName(fullName);
        student.setEmail(newEmail);
        student.setDepartment(department);
        student.setYear(year);

        // IMPORTANT:
        // Password is intentionally NOT changed here.

        return studentRepository.save(student);
    }

    // =========================
    // UPDATE STUDENT BY ID
    // =========================

    public Student updateStudent(
            Integer id,
            String fullName,
            String email,
            String department,
            String year) {

        Student student = studentRepository
                .findById(id)
                .orElse(null);

        if (student == null) {
            return null;
        }

        if (!student.getEmail().equalsIgnoreCase(email)) {

            Student existingStudent =
                    studentRepository
                            .findByEmail(email)
                            .orElse(null);

            if (existingStudent != null &&
                !existingStudent
                        .getId()
                        .equals(student.getId())) {

                throw new IllegalStateException(
                        "A student with this email already exists"
                );
            }
        }

        student.setFullName(fullName);
        student.setEmail(email);
        student.setDepartment(department);
        student.setYear(year);

        return studentRepository.save(student);
    }

    // =========================
    // DELETE STUDENT
    // =========================

    public void deleteStudent(Integer id) {
        studentRepository.deleteById(id);
    }
}
