package com.campusconnect.campusconnect.mapper;

import com.campusconnect.campusconnect.dto.StudentResponse;
import com.campusconnect.campusconnect.model.Student;
import org.springframework.stereotype.Component;

@Component
public class StudentMapper {

    public StudentResponse toResponse(Student student) {

        StudentResponse response = new StudentResponse();

        response.setId(student.getId());
        response.setFullName(student.getFullName());
        response.setEmail(student.getEmail());
        response.setDepartment(student.getDepartment());
        response.setYear(student.getYear());

        return response;
    }
}