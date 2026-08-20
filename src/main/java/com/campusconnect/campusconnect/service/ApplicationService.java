package com.campusconnect.campusconnect.service;

import com.campusconnect.campusconnect.model.Application;
import com.campusconnect.campusconnect.model.Company;
import com.campusconnect.campusconnect.model.Student;

import com.campusconnect.campusconnect.repository.ApplicationRepository;
import com.campusconnect.campusconnect.repository.CompanyRepository;
import com.campusconnect.campusconnect.repository.StudentRepository;

import org.apache.poi.common.usermodel.HyperlinkType;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ApplicationService {

    private static final long MAX_RESUME_SIZE =
            5L * 1024L * 1024L;

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            StudentRepository studentRepository,
            CompanyRepository companyRepository) {

        this.applicationRepository =
                applicationRepository;

        this.studentRepository =
                studentRepository;

        this.companyRepository =
                companyRepository;
    }

    // =====================================================
    // GET ALL APPLICATIONS
    // =====================================================

    public List<Application> getAllApplications() {

        return applicationRepository.findAll();
    }

    // =====================================================
    // GET APPLICATION BY ID
    // =====================================================

    public Application getApplicationById(Integer id) {

        return applicationRepository
                .findById(id)
                .orElse(null);
    }

    // =====================================================
    // GET APPLICATIONS OF A STUDENT
    // Latest applications first
    // =====================================================

    public List<Application> getApplicationsByStudentId(
            Integer studentId) {

        return applicationRepository
                .findByStudentIdOrderByAppliedAtDesc(
                        studentId
                );
    }

    // =====================================================
// SAVE APPLICATION
// =====================================================

public Application saveApplication(
        Application application,
        MultipartFile resume) {

    // =================================================
    // CHECK STUDENT ID
    // =================================================

    if (application.getStudentId() == null) {

        throw new IllegalArgumentException(
                "Student ID is required"
        );
    }

    // =================================================
    // CHECK COMPANY ID
    // =================================================

    if (application.getCompanyId() == null) {

        throw new IllegalArgumentException(
                "Company ID is required"
        );
    }

    // =================================================
    // CHECK RESUME
    // =================================================

    if (resume == null || resume.isEmpty()) {

        throw new IllegalArgumentException(
                "Resume is required"
        );
    }

    // =================================================
    // MAXIMUM RESUME SIZE = 5 MB
    // =================================================

    if (resume.getSize() > MAX_RESUME_SIZE) {

        throw new IllegalArgumentException(
                "Resume must not exceed 5 MB"
        );
    }

    // =================================================
    // ONLY PDF ALLOWED
    // =================================================

    String contentType =
            resume.getContentType();

    if (!"application/pdf"
            .equalsIgnoreCase(contentType)) {

        throw new IllegalArgumentException(
                "Only PDF resumes are allowed"
        );
    }

    // =================================================
    // CHECK FILE NAME
    // =================================================

    String originalFilename =
            resume.getOriginalFilename();

    if (originalFilename == null ||
            !originalFilename
                    .toLowerCase()
                    .endsWith(".pdf")) {

        throw new IllegalArgumentException(
                "Resume file must be a PDF"
        );
    }

    // =================================================
    // CHECK STUDENT EXISTS
    // =================================================

    if (!studentRepository.existsById(
            application.getStudentId())) {

        throw new IllegalArgumentException(
                "Student with ID " +
                        application.getStudentId() +
                        " does not exist"
        );
    }

    // =================================================
    // GET COMPANY
    // =================================================

    Company company =
            companyRepository
                    .findById(
                            application.getCompanyId()
                    )
                    .orElse(null);

    if (company == null) {

        throw new IllegalArgumentException(
                "Company with ID " +
                        application.getCompanyId() +
                        " does not exist"
        );
    }

    // =================================================
    // CHECK APPLICATION DEADLINE
    //
    // IMPORTANT:
    // This check is performed on the backend.
    // A student cannot bypass the deadline by
    // directly calling the API.
    // =================================================

    LocalDateTime deadline =
            company.getApplicationDeadline();

    if (deadline != null &&
            !LocalDateTime.now().isBefore(deadline)) {

        throw new IllegalStateException(
                "Application deadline has passed"
        );
    }

    // =================================================
    // PREVENT DUPLICATE APPLICATION
    // =================================================

    if (applicationRepository
            .findByStudentIdAndCompanyId(
                    application.getStudentId(),
                    application.getCompanyId()
            )
            .isPresent()) {

        throw new IllegalStateException(
                "Student has already applied to this company"
        );
    }

    // =================================================
    // SET APPLICATION TIME
    // =================================================

    if (application.getAppliedAt() == null) {

        application.setAppliedAt(
                LocalDateTime.now()
        );
    }

    // =================================================
    // SAVE RESUME DATA
    // =================================================

    try {

        application.setResumeData(
                resume.getBytes()
        );

    } catch (IOException e) {

        throw new IllegalArgumentException(
                "Unable to read the uploaded resume",
                e
        );
    }

    application.setResumeOriginalName(
            originalFilename
    );

    application.setResumeContentType(
            contentType
    );

    application.setResumeSize(
            resume.getSize()
    );

    // =================================================
    // SAVE APPLICATION
    // =================================================

    return applicationRepository.save(
            application
    );
}

    // =====================================================
    // GENERATE APPLICATION ZIP
    //
    // ZIP contains:
    //
    // HCLTech-Applications.xlsx
    // Resumes/
    //     APP-0001_Name.pdf
    //     APP-0002_Name.pdf
    //
    // =====================================================

    public byte[] generateApplicationsZip(
            Integer companyId) {

        try {

            // =================================================
            // GET APPLICATIONS
            // =================================================

            List<Application> applications;

            if (companyId == null) {

                applications =
                        applicationRepository.findAll();

            } else {

                applications =
                        applicationRepository
                                .findAll()
                                .stream()
                                .filter(application ->
                                        companyId.equals(
                                                application.getCompanyId()
                                        )
                                )
                                .toList();
            }

            // =================================================
            // CREATE EXCEL WORKBOOK
            // =================================================

            try (
                    Workbook workbook =
                            new XSSFWorkbook()
            ) {

                Sheet sheet =
                        workbook.createSheet(
                                "Applications"
                        );

                // =================================================
                // HEADER STYLE
                // =================================================

                Font headerFont =
                        workbook.createFont();

                headerFont.setBold(true);

                CellStyle headerStyle =
                        workbook.createCellStyle();

                headerStyle.setFont(headerFont);

                headerStyle.setAlignment(
                        HorizontalAlignment.CENTER
                );

                headerStyle.setVerticalAlignment(
                        VerticalAlignment.CENTER
                );

                // =================================================
                // HEADER
                // =================================================

                Row headerRow =
                        sheet.createRow(0);

                String[] headers = {

                        "Application ID",
                        "Student Name",
                        "Email",
                        "Department",
                        "Year",
                        "Company",
                        "Role",
                        "Package",
                        "Location",
                        "Eligibility",
                        "Applied On",
                        "Resume"

                };

                for (int i = 0;
                     i < headers.length;
                     i++) {

                    Cell cell =
                            headerRow.createCell(i);

                    cell.setCellValue(
                            headers[i]
                    );

                    cell.setCellStyle(
                            headerStyle
                    );
                }

                // =================================================
                // DATE FORMAT
                // =================================================

                DateTimeFormatter formatter =
                        DateTimeFormatter.ofPattern(
                                "dd MMM yyyy, hh:mm a"
                        );

                // =================================================
                // CREATE APPLICATION ROWS
                // =================================================

                int rowNumber = 1;

                for (Application application :
                        applications) {

                    Student student =
                            studentRepository
                                    .findById(
                                            application
                                                    .getStudentId()
                                    )
                                    .orElse(null);

                    Company company =
                            companyRepository
                                    .findById(
                                            application
                                                    .getCompanyId()
                                    )
                                    .orElse(null);

                    String applicationId =
                            String.format(
                                    "APP-%04d",
                                    application.getId()
                            );

                    String studentName =
                            student != null
                                    ? student.getFullName()
                                    : "";

                    String email =
                            student != null
                                    ? student.getEmail()
                                    : "";

                    String department =
                            student != null
                                    ? student.getDepartment()
                                    : "";

                    String year =
                            student != null
                                    ? student.getYear()
                                    : "";

                    String companyName =
                            company != null
                                    ? company.getCompanyName()
                                    : "";

                    String role =
                            company != null
                                    ? company.getRole()
                                    : "";

                    String packageName =
                            company != null
                                    ? company.getPackageName()
                                    : "";

                    String location =
                            company != null
                                    ? company.getLocation()
                                    : "";

                    String eligibility =
                            company != null
                                    ? company.getEligibility()
                                    : "";

                    String appliedOn =
                            application.getAppliedAt() != null
                                    ? application
                                            .getAppliedAt()
                                            .format(formatter)
                                    : "";

                    // =================================================
                    // CREATE SAFE RESUME FILE NAME
                    // =================================================

                    String safeStudentName =
                            sanitizeFileName(
                                    studentName
                            );

                    if (safeStudentName.isBlank()) {

                        safeStudentName =
                                "Student";
                    }

                    String resumeFileName =
                            applicationId +
                                    "_" +
                                    safeStudentName +
                                    ".pdf";

                    String resumePath =
                            "Resumes/" +
                                    resumeFileName;

                    // =================================================
                    // EXCEL ROW
                    // =================================================

                    Row row =
                            sheet.createRow(
                                    rowNumber++
                            );

                    row.createCell(0)
                            .setCellValue(
                                    applicationId
                            );

                    row.createCell(1)
                            .setCellValue(
                                    studentName
                            );

                    row.createCell(2)
                            .setCellValue(
                                    email
                            );

                    row.createCell(3)
                            .setCellValue(
                                    department
                            );

                    row.createCell(4)
                            .setCellValue(
                                    year
                            );

                    row.createCell(5)
                            .setCellValue(
                                    companyName
                            );

                    row.createCell(6)
                            .setCellValue(
                                    role
                            );

                    row.createCell(7)
                            .setCellValue(
                                    packageName
                            );

                    row.createCell(8)
                            .setCellValue(
                                    location
                            );

                    row.createCell(9)
                            .setCellValue(
                                    eligibility
                            );

                    row.createCell(10)
                            .setCellValue(
                                    appliedOn
                            );

                    // =================================================
                    // RESUME HYPERLINK
                    // =================================================

                    Cell resumeCell =
                            row.createCell(11);

                    if (application.getResumeData() != null &&
                            application.getResumeData().length > 0) {

                        resumeCell.setCellValue(
                                "View Resume ↗"
                        );

                        CreationHelper helper =
                                workbook.getCreationHelper();

                        Hyperlink hyperlink =
                                helper.createHyperlink(
                                        HyperlinkType.FILE
                                );

                        hyperlink.setAddress(
                                resumePath
                        );

                        resumeCell.setHyperlink(
                                hyperlink
                        );

                        Font hyperlinkFont =
                                workbook.createFont();

                        hyperlinkFont.setUnderline(
                                Font.U_SINGLE
                        );

                        hyperlinkFont.setColor(
                                IndexedColors.BLUE.getIndex()
                        );

                        CellStyle hyperlinkStyle =
                                workbook.createCellStyle();

                        hyperlinkStyle.setFont(
                                hyperlinkFont
                        );

                        resumeCell.setCellStyle(
                                hyperlinkStyle
                        );
                    } else {

                        resumeCell.setCellValue(
                                "Resume unavailable"
                        );
                    }
                }

                // =================================================
                // COLUMN WIDTHS
                // =================================================

                int[] widths = {

                        18,
                        25,
                        32,
                        18,
                        14,
                        24,
                        24,
                        18,
                        24,
                        28,
                        24,
                        22

                };

                for (int i = 0;
                     i < widths.length;
                     i++) {

                    sheet.setColumnWidth(
                            i,
                            widths[i] * 256
                    );
                }

                // =================================================
                // FREEZE HEADER
                // =================================================

                sheet.createFreezePane(0, 1);

                // =================================================
                // WRITE EXCEL TO MEMORY
                // =================================================

                ByteArrayOutputStream excelOutput =
                        new ByteArrayOutputStream();

                workbook.write(
                        excelOutput
                );

                byte[] excelData =
                        excelOutput.toByteArray();

                // =================================================
                // CREATE ZIP
                // =================================================

                ByteArrayOutputStream zipOutput =
                        new ByteArrayOutputStream();

                try (
                        ZipOutputStream zip =
                                new ZipOutputStream(
                                        zipOutput
                                )
                ) {

                    // =================================================
                    // EXCEL FILE
                    // =================================================

                    String excelFileName;

                    if (companyId != null) {

                        excelFileName =
                                "Company-" +
                                        companyId +
                                        "-Applications.xlsx";

                    } else {

                        excelFileName =
                                "CampusConnect-Applications.xlsx";
                    }

                    zip.putNextEntry(
                            new ZipEntry(
                                    excelFileName
                            )
                    );

                    zip.write(
                            excelData
                    );

                    zip.closeEntry();

                    // =================================================
                    // RESUME FILES
                    // =================================================

                    for (Application application :
                            applications) {

                        byte[] resumeData =
                                application
                                        .getResumeData();

                        if (resumeData == null ||
                                resumeData.length == 0) {

                            continue;
                        }

                        Student student =
                                studentRepository
                                        .findById(
                                                application
                                                        .getStudentId()
                                        )
                                        .orElse(null);

                        String studentName =
                                student != null
                                        ? student.getFullName()
                                        : "Student";

                        String safeStudentName =
                                sanitizeFileName(
                                        studentName
                                );

                        if (safeStudentName.isBlank()) {

                            safeStudentName =
                                    "Student";
                        }

                        String applicationId =
                                String.format(
                                        "APP-%04d",
                                        application.getId()
                                );

                        String resumeFileName =
                                applicationId +
                                        "_" +
                                        safeStudentName +
                                        ".pdf";

                        String resumePath =
                                "Resumes/" +
                                        resumeFileName;

                        zip.putNextEntry(
                                new ZipEntry(
                                        resumePath
                                )
                        );

                        zip.write(
                                resumeData
                        );

                        zip.closeEntry();
                    }
                }

                return zipOutput.toByteArray();
            }

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Unable to generate application ZIP",
                    e
            );
        }
    }

    // =====================================================
    // SANITIZE FILE NAME
    // =====================================================

    private String sanitizeFileName(
            String value) {

        if (value == null) {

            return "";
        }

        return value
                .trim()
                .replaceAll(
                        "[\\\\/:*?\"<>|]",
                        "_"
                )
                .replaceAll(
                        "\\s+",
                        "_"
                );
    }

    // =====================================================
    // DELETE APPLICATION
    // =====================================================

    public void deleteApplication(
            Integer id) {

        applicationRepository.deleteById(
                id
        );
    }
}