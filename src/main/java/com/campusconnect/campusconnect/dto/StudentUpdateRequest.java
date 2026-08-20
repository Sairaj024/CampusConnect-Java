package com.campusconnect.campusconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class StudentUpdateRequest {

    @NotBlank(message = "Full name is required")
    @Size(
        max = 100,
        message = "Full name must not exceed 100 characters"
    )
    private String fullName;


    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(
        max = 150,
        message = "Email must not exceed 150 characters"
    )
    private String email;


    @NotBlank(message = "Department is required")
    @Size(
        max = 100,
        message = "Department must not exceed 100 characters"
    )
    private String department;


    @NotBlank(message = "Year is required")
    @Size(
        max = 50,
        message = "Year must not exceed 50 characters"
    )
    private String year;


    public StudentUpdateRequest() {
    }


    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }


    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }
}
