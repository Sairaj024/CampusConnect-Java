package com.campusconnect.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CompanyRequest {

    @NotBlank(message = "Company name is required")
    @Size(
        max = 100,
        message = "Company name must not exceed 100 characters"
    )
    private String companyName;


    @NotBlank(message = "Role is required")
    @Size(
        max = 100,
        message = "Role must not exceed 100 characters"
    )
    private String role;


    @NotBlank(message = "Package is required")
    @Size(
        max = 50,
        message = "Package must not exceed 50 characters"
    )
    private String packageName;


    @NotBlank(message = "Location is required")
    @Size(
        max = 100,
        message = "Location must not exceed 100 characters"
    )
    private String location;


    @NotBlank(message = "Eligibility is required")
    @Size(
        max = 100,
        message = "Eligibility must not exceed 100 characters"
    )
    private String eligibility;


    @NotBlank(message = "Application deadline is required")
    @Pattern(
        regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$",
        message = "Application deadline must be in YYYY-MM-DDTHH:MM format"
    )
    private String applicationDeadline;


    public CompanyRequest() {
    }


    // =========================
    // COMPANY NAME
    // =========================

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }


    // =========================
    // ROLE
    // =========================

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }


    // =========================
    // PACKAGE
    // =========================

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }


    // =========================
    // LOCATION
    // =========================

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }


    // =========================
    // ELIGIBILITY
    // =========================

    public String getEligibility() {
        return eligibility;
    }

    public void setEligibility(String eligibility) {
        this.eligibility = eligibility;
    }


    // =========================
    // APPLICATION DEADLINE
    // =========================

    public String getApplicationDeadline() {
        return applicationDeadline;
    }

    public void setApplicationDeadline(
            String applicationDeadline) {

        this.applicationDeadline = applicationDeadline;
    }
}