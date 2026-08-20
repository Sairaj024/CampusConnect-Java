package com.campusconnect.campusconnect.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    @Column(name = "company_id", nullable = false)
    private Integer companyId;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    // =====================================================
    // RESUME INFORMATION
    // =====================================================

    @Column(name = "resume_original_name")
    private String resumeOriginalName;

    @Column(name = "resume_content_type")
    private String resumeContentType;

    @Column(name = "resume_size")
    private Long resumeSize;

    /*
     * The actual PDF file.
     *
     * @JsonIgnore is important because we do NOT want
     * Spring/Jackson to send the complete PDF as JSON
     * whenever an application is returned.
     */
    @Lob
    @Basic(fetch = FetchType.LAZY)
    @JsonIgnore
    @Column(name = "resume_data", columnDefinition = "MEDIUMBLOB")
    private byte[] resumeData;

    public Application() {
    }

    // =====================================================
    // ID
    // =====================================================

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    // =====================================================
    // STUDENT ID
    // =====================================================

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    // =====================================================
    // COMPANY ID
    // =====================================================

    public Integer getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Integer companyId) {
        this.companyId = companyId;
    }

    // =====================================================
    // APPLIED AT
    // =====================================================

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    // =====================================================
    // RESUME ORIGINAL NAME
    // =====================================================

    public String getResumeOriginalName() {
        return resumeOriginalName;
    }

    public void setResumeOriginalName(String resumeOriginalName) {
        this.resumeOriginalName = resumeOriginalName;
    }

    // =====================================================
    // RESUME CONTENT TYPE
    // =====================================================

    public String getResumeContentType() {
        return resumeContentType;
    }

    public void setResumeContentType(String resumeContentType) {
        this.resumeContentType = resumeContentType;
    }

    // =====================================================
    // RESUME SIZE
    // =====================================================

    public Long getResumeSize() {
        return resumeSize;
    }

    public void setResumeSize(Long resumeSize) {
        this.resumeSize = resumeSize;
    }

    // =====================================================
    // RESUME DATA
    // =====================================================

    public byte[] getResumeData() {
        return resumeData;
    }

    public void setResumeData(byte[] resumeData) {
        this.resumeData = resumeData;
    }
}