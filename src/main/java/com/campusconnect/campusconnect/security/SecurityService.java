package com.campusconnect.campusconnect.security;

import com.campusconnect.campusconnect.model.Admin;
import com.campusconnect.campusconnect.model.Student;
import com.campusconnect.campusconnect.repository.AdminRepository;
import com.campusconnect.campusconnect.repository.StudentRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SecurityService {

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public SecurityService(
            AdminRepository adminRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {

        this.adminRepository = adminRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Admin authenticate(String username, String password) {

        Admin admin = adminRepository.findAll()
                .stream()
                .filter(a -> a.getUsername().equals(username))
                .findFirst()
                .orElse(null);

        if (admin == null) {
            return null;
        }

        if (!passwordEncoder.matches(
                password,
                admin.getPassword())) {

            return null;
        }

        return admin;
    }

    public Student authenticateStudent(
            String email,
            String password) {

        Student student = studentRepository
                .findByEmail(email)
                .orElse(null);

        if (student == null) {
            return null;
        }

        if (!passwordEncoder.matches(
                password,
                student.getPassword())) {

            return null;
        }

        return student;
    }

    public Student registerStudent(
            String fullName,
            String email,
            String password,
            String department,
            String year) {

        if (studentRepository
                .findByEmail(email)
                .isPresent()) {

            return null;
        }

        Student student = new Student();

        student.setFullName(fullName);
        student.setEmail(email);
        student.setPassword(
                passwordEncoder.encode(password)
        );
        student.setDepartment(department);
        student.setYear(year);

        return studentRepository.save(student);
    }
}
