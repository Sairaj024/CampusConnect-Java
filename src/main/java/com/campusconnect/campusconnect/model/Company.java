package com.campusconnect.campusconnect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "company_name")
    private String companyName;

    private String role;

    @Column(name = "package")
    private String packageName;

    private String location;

    private String eligibility;

    @Column(name = "application_deadline")
    private LocalDateTime applicationDeadline;

    public Company() {
    }

    // =========================
    // ID
    // =========================

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public LocalDateTime getApplicationDeadline() {
        return applicationDeadline;
    }

    public void setApplicationDeadline(
            LocalDateTime applicationDeadline) {

        this.applicationDeadline = applicationDeadline;
    }
}