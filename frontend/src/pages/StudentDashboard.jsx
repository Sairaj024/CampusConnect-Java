import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./StudentDashboard.css";

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Keep the sidebar highlight synchronized with the section
    // currently selected through the URL hash.
    const [activeSection, setActiveSection] = useState(
        window.location.hash.replace("#", "") || "overview"
    );

    const [student, setStudent] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [applications, setApplications] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());

    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [error, setError] = useState("");

    // Resume upload application modal
    const [applicationCompany, setApplicationCompany] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeError, setResumeError] = useState("");

    /*
     * Student login stores the student's database ID
     * as studentId.
     *
     * adminId is kept as a fallback so an older login
     * session does not immediately break the dashboard.
     */
    const studentId = user?.studentId || user?.adminId;

    useEffect(() => {
        const handleHashChange = () => {
            setActiveSection(
                window.location.hash.replace("#", "") || "overview"
            );
        };

        // Handle direct navigation and browser back/forward.
        handleHashChange();
        window.addEventListener("hashchange", handleHashChange);

        return () => {
            window.removeEventListener(
                "hashchange",
                handleHashChange
            );
        };
    }, []);

    // =========================
    // DEADLINE CLOCK
    // =========================

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const loadDashboard = async () => {
        if (!studentId) {
            setLoading(false);
            setError(
                "Student information could not be found. Please log in again."
            );
            return;
        }

        setLoading(true);
        setError("");

        try {
            const [
                studentResponse,
                companiesResponse,
                announcementsResponse,
                applicationsResponse,
            ] = await Promise.all([
                api.get(`/students/${studentId}`),
                api.get("/companies"),
                api.get("/announcements"),
                api.get("/applications/my"),
            ]);

            setStudent(studentResponse.data);
            setCompanies(companiesResponse.data || []);
            setAnnouncements(
                announcementsResponse.data || []
            );
            setApplications(
                applicationsResponse.data || []
            );

        } catch (err) {
            console.error(
                "Dashboard error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load dashboard data."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) {
            loadDashboard();
        } else {
            setLoading(false);
            setError(
                "Student information could not be found. Please log in again."
            );
        }
    }, [studentId]);

    const hasApplied = (companyId) => {
        return applications.some(
            (application) =>
                Number(application.companyId) ===
                Number(companyId)
        );
    };

    // =========================
    // APPLICATION DEADLINE
    // =========================

    // Support both the normal Java/Jackson camelCase response
    // and snake_case in case the API response uses that format.
    const getApplicationDeadline = (company) => {
        return (
            company?.applicationDeadline ||
            company?.application_deadline ||
            null
        );
    };

    const formatDeadline = (deadline) => {
        if (!deadline) {
            return "—";
        }

        const date = new Date(deadline);

        if (Number.isNaN(date.getTime())) {
            return "Deadline unavailable";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getDeadlineStatus = (deadline) => {
        if (!deadline) {
            return {
                closed: false,
                text: "No deadline set",
            };
        }

        const deadlineTime = new Date(deadline).getTime();

        if (Number.isNaN(deadlineTime)) {
            return {
                closed: false,
                text: "Deadline unavailable",
            };
        }

        const difference = deadlineTime - currentTime;

        if (difference <= 0) {
            return {
                closed: true,
                text: "Application Closed",
            };
        }

        const totalSeconds = Math.floor(difference / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (days > 0) {
            return {
                closed: false,
                text: `${days}d ${hours}h ${minutes}m`,
            };
        }

        if (hours > 0) {
            return {
                closed: false,
                text: `${hours}h ${minutes}m ${seconds}s`,
            };
        }

        if (minutes > 0) {
            return {
                closed: false,
                text: `${minutes}m ${seconds}s`,
            };
        }

        return {
            closed: false,
            text: `${seconds}s`,
        };
    };

    const openApplicationModal = (company) => {
        const deadlineStatus = getDeadlineStatus(
            getApplicationDeadline(company)
        );

        if (deadlineStatus.closed) {
            setError(
                "Applications for this company are closed."
            );
            return;
        }

        setApplicationCompany(company);
        setResumeFile(null);
        setResumeError("");
        setError("");
    };

    const closeApplicationModal = () => {
        if (applying !== null) return;
        setApplicationCompany(null);
        setResumeFile(null);
        setResumeError("");
    };

    const handleResumeChange = (event) => {
        const file = event.target.files?.[0];
        setResumeError("");
        if (!file) { setResumeFile(null); return; }
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) { event.target.value = ""; setResumeFile(null); setResumeError("Only PDF files are allowed."); return; }
        if (file.size > 5 * 1024 * 1024) { event.target.value = ""; setResumeFile(null); setResumeError("Resume must not exceed 5 MB."); return; }
        setResumeFile(file);
    };

    const removeResume = () => {
        setResumeFile(null);
        setResumeError("");
        const input = document.getElementById("student-resume-upload");
        if (input) input.value = "";
    };

    const submitApplication = async (event) => {
        event.preventDefault();
        if (!applicationCompany) return;

        const deadlineStatus = getDeadlineStatus(
            getApplicationDeadline(applicationCompany)
        );

        if (deadlineStatus.closed) {
            setResumeError(
                "Applications for this company are closed."
            );
            return;
        }

        if (!resumeFile) {
            setResumeError(
                "Please select your resume before submitting."
            );
            return;
        }
        setApplying(applicationCompany.id);
        setResumeError("");
        setError("");
        try {
            const formData = new FormData();
            formData.append("companyId", String(applicationCompany.id));
            formData.append("resume", resumeFile);
            await api.post("/applications", formData);
            await loadDashboard();
            setApplicationCompany(null);
            setResumeFile(null);
        } catch (err) {
            console.error("Application error:", err);
            setResumeError(err.response?.data?.message || "Unable to submit your application.");
        } finally {
            setApplying(null);
        }
    };

    const withdrawApplication = async (
        applicationId
    ) => {
        if (
            !window.confirm(
                "Withdraw this application?"
            )
        ) {
            return;
        }

        try {
            await api.delete(
                `/applications/${applicationId}`
            );

            await loadDashboard();

        } catch (err) {
            console.error(
                "Withdraw error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to withdraw application."
            );
        }
    };

    if (loading) {
        return (
            <div className="student-loading">
                <div className="loading-spinner"></div>

                <p>
                    Loading your student portal...
                </p>
            </div>
        );
    }

    return (
        <div className="student-layout">

            {/* =========================
                SIDEBAR
            ========================== */}

            <aside className="student-sidebar">

                <div className="student-brand">

                    <div className="student-brand-logo">
                        CC
                    </div>

                    <div>
                        <strong>
                            CampusConnect
                        </strong>

                        <span>
                            Student Portal
                        </span>
                    </div>

                </div>

                <nav className="student-nav">

                    <a
                        href="#overview"
                        className={
                            activeSection === "overview"
                                ? "active"
                                : ""
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </a>

                    <a
                        href="#companies"
                        className={
                            activeSection === "companies"
                                ? "active"
                                : ""
                        }
                    >
                        <span>▣</span>
                        Companies
                    </a>

                    <a
                        href="#applications"
                        className={
                            activeSection === "applications"
                                ? "active"
                                : ""
                        }
                    >
                        <span>✓</span>
                        My Applications
                    </a>

                    <a
                        href="#announcements"
                        className={
                            activeSection === "announcements"
                                ? "active"
                                : ""
                        }
                    >
                        <span>●</span>
                        Announcements
                    </a>

                    <a
                        href="#profile"
                        className={
                            activeSection === "profile"
                                ? "active"
                                : ""
                        }
                    >
                        <span>♙</span>
                        My Profile
                    </a>

                </nav>

                <div className="student-sidebar-bottom">

                    <div className="student-user">

                        <div className="student-avatar">

                            {(
                                student?.fullName ||
                                user?.username ||
                                "S"
                            )
                                .charAt(0)
                                .toUpperCase()}

                        </div>

                        <div>

                            <strong>
                                {student?.fullName ||
                                    user?.username ||
                                    "Student"}
                            </strong>

                            <span>
                                Student
                            </span>

                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        ↪ Logout
                    </button>

                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================== */}

            <main className="student-main">

                <header className="student-header">

                    <div>

                        <span className="student-eyebrow">
                            STUDENT PORTAL
                        </span>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Manage your placement journey
                            from one place.
                        </p>

                    </div>

                    <button
                        className="refresh-button"
                        onClick={loadDashboard}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                </header>


                {/* ERROR */}

                {error && (
                    <div className="dashboard-error">

                        {error}

                    </div>
                )}


                {/* =========================
                    OVERVIEW
                ========================== */}

                <section
                    id="overview"
                    className="stats-grid"
                >

                    <div className="stat-card">

                        <div>

                            <span>
                                Total Companies
                            </span>

                            <strong>
                                {companies.length}
                            </strong>

                            <small>
                                Placement opportunities
                            </small>

                        </div>

                        <div className="stat-icon purple">
                            ▣
                        </div>

                    </div>


                    <div className="stat-card">

                        <div>

                            <span>
                                My Applications
                            </span>

                            <strong>
                                {applications.length}
                            </strong>

                            <small>
                                Applications submitted
                            </small>

                        </div>

                        <div className="stat-icon green">
                            ✓
                        </div>

                    </div>


                    <div className="stat-card">

                        <div>

                            <span>
                                Announcements
                            </span>

                            <strong>
                                {announcements.length}
                            </strong>

                            <small>
                                Campus updates
                            </small>

                        </div>

                        <div className="stat-icon blue">
                            ●
                        </div>

                    </div>


                    <div className="stat-card">

                        <div>

                            <span>
                                Profile
                            </span>

                            <strong>
                                {student ? "100%" : "0%"}
                            </strong>

                            <small>
                                Profile information
                            </small>

                        </div>

                        <div className="stat-icon orange">
                            ♙
                        </div>

                    </div>

                </section>


                {/* =========================
                    COMPANIES
                ========================== */}

                <section
                    id="companies"
                    className="dashboard-section"
                >

                    <div className="section-heading">

                        <div>

                            <h2>
                                Placement Opportunities
                            </h2>

                            <p>
                                Companies currently available
                                for students.
                            </p>

                        </div>

                    </div>


                    <div className="company-grid">

                        {companies.length === 0 ? (

                            <div className="empty-state">

                                <h3>
                                    No companies available
                                </h3>

                                <p>
                                    New placement opportunities
                                    will appear here.
                                </p>

                            </div>

                        ) : (

                            companies.map((company) => {

                                const applied =
                                    hasApplied(company.id);

                                const deadlineStatus =
                                    getDeadlineStatus(
                                        getApplicationDeadline(company)
                                    );

                                const applicationClosed =
                                    deadlineStatus.closed;

                                return (
                                    <div
                                        className="company-card"
                                        key={company.id}
                                    >

                                        <div className="company-card-top">

                                            <div className="company-logo">

                                                {(
                                                    company.companyName ||
                                                    company.name ||
                                                    "C"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}

                                            </div>

                                            <span className="company-role">
                                                {company.role ||
                                                    "Placement"}
                                            </span>

                                        </div>


                                        <h3>
                                            {company.companyName ||
                                                company.name ||
                                                "Company"}
                                        </h3>


                                        <div className="company-details">

                                            {(
                                                company.package ||
                                                company.packageName
                                            ) && (
                                                <span>
                                                    ₹{" "}
                                                    {company.package ||
                                                        company.packageName}
                                                </span>
                                            )}

                                            {company.location && (
                                                <span>
                                                    📍{" "}
                                                    {company.location}
                                                </span>
                                            )}

                                            {company.eligibility && (
                                                <span>
                                                    🎓{" "}
                                                    {company.eligibility}
                                                </span>
                                            )}

                                        </div>


                                        <div
                                            className={
                                                applicationClosed
                                                    ? "application-deadline closed"
                                                    : "application-deadline"
                                            }
                                        >
                                            {applicationClosed ? (
                                                <>
                                                    <span className="deadline-icon">
                                                        ●
                                                    </span>

                                                    <div>
                                                        <strong>
                                                            Application Closed
                                                        </strong>

                                                        <small>
                                                            Registration deadline has passed.
                                                        </small>
                                                    </div>
                                                </>
                                            ) : getApplicationDeadline(company) ? (
                                                <>
                                                    <span className="deadline-icon">
                                                        ⏳
                                                    </span>

                                                    <div>
                                                        <strong>
                                                            Closes in {deadlineStatus.text}
                                                        </strong>

                                                        <small>
                                                            Apply before {formatDeadline(
                                                                getApplicationDeadline(company)
                                                            )}
                                                        </small>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="deadline-icon">
                                                        ⏳
                                                    </span>

                                                    <div>
                                                        <strong>
                                                            No deadline set
                                                        </strong>

                                                        <small>
                                                            Check the placement details.
                                                        </small>
                                                    </div>
                                                </>
                                            )}
                                        </div>


                                        <button
                                            className={
                                                applied
                                                    ? "applied-button"
                                                    : applicationClosed
                                                    ? "closed-button"
                                                    : "apply-button"
                                            }
                                            disabled={
                                                applied ||
                                                applicationClosed ||
                                                applying ===
                                                    company.id
                                            }
                                            onClick={() =>
                                                openApplicationModal(company)
                                            }
                                        >

                                            {applying ===
                                            company.id
                                                ? "Applying..."
                                                : applied
                                                ? "✓ Applied"
                                                : applicationClosed
                                                ? "Application Closed"
                                                : "Apply Now"}

                                        </button>

                                    </div>
                                );
                            })

                        )}

                    </div>

                </section>


                {/* =========================
                    APPLICATIONS
                ========================== */}

                <section
                    id="applications"
                    className="dashboard-section"
                >

                    <div className="section-heading">

                        <div>

                            <h2>
                                My Applications
                            </h2>

                            <p>
                                Track the companies you have
                                applied to.
                            </p>

                        </div>

                    </div>


                    <div className="applications-card">

                        {applications.length === 0 ? (

                            <div className="empty-state">

                                <h3>
                                    No applications yet
                                </h3>

                                <p>
                                    Apply to a company above
                                    to start your placement
                                    journey.
                                </p>

                            </div>

                        ) : (

                            <div className="application-table-wrapper">

                                <table className="application-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Application
                                            </th>

                                            <th>
                                                Company
                                            </th>

                                            <th>
                                                Applied On
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {applications.map(
                                            (application) => {

                                                const company =
                                                    companies.find(
                                                        (item) =>
                                                            Number(
                                                                item.id
                                                            ) ===
                                                            Number(
                                                                application.companyId
                                                            )
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            application.id
                                                        }
                                                    >

                                                        <td>

                                                            <strong>
                                                                APP-
                                                                {String(
                                                                    application.id
                                                                ).padStart(
                                                                    4,
                                                                    "0"
                                                                )}
                                                            </strong>

                                                        </td>

                                                        <td>

                                                            {company?.companyName ||
                                                                company?.name ||
                                                                `Company #${application.companyId}`}

                                                        </td>

                                                        <td>

                                                            {application.appliedAt
                                                                ? new Date(
                                                                      application.appliedAt
                                                                  ).toLocaleDateString(
                                                                      "en-IN",
                                                                      {
                                                                          day: "2-digit",
                                                                          month: "short",
                                                                          year: "numeric",
                                                                      }
                                                                  )
                                                                : "—"}

                                                        </td>

                                                        <td>

                                                            <span className="status-badge">
                                                                Applied
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <button
                                                                className="withdraw-button"
                                                                onClick={() =>
                                                                    withdrawApplication(
                                                                        application.id
                                                                    )
                                                                }
                                                            >
                                                                Withdraw
                                                            </button>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </section>


                {/* =========================
                    ANNOUNCEMENTS
                ========================== */}

                <section
                    id="announcements"
                    className="dashboard-section"
                >

                    <div className="section-heading">

                    <div>
                            <h2>
                                Announcements
                            </h2>

                            <p>
                                Latest updates from your campus.
                            </p>
                        </div>

                    </div>

                    <div className="announcement-grid">

                        {announcements.length === 0 ? (

                            <div className="empty-state">

                                <h3>
                                    No announcements
                                </h3>

                                <p>
                                    Campus announcements will appear here.
                                </p>

                            </div>

                        ) : (

                            announcements.map((announcement) => (

                                <article
                                    className="announcement-card"
                                    key={announcement.id}
                                >

                                    <div className="announcement-icon">
                                        ●
                                    </div>

                                    <div className="announcement-content">

                                        <h3>
                                            {announcement.title}
                                        </h3>

                                        <p>
                                            {announcement.message}
                                        </p>

                                    </div>

                                </article>

                            ))

                        )}

                    </div>

                </section>


                {/* =========================
                    PROFILE
                ========================== */}

                <section
                    id="profile"
                    className="dashboard-section"
                >

                    <div className="section-heading">

                        <div>
                            <h2>
                                My Profile
                            </h2>

                            <p>
                                Your registered student information.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="edit-profile-button"
                            onClick={() => navigate("/student/profile")}
                        >
                            Edit Profile
                        </button>

                    </div>


                    <div className="profile-card student-dashboard-profile">

                        {/* LEFT — STUDENT IDENTITY */}

                        <div className="student-dashboard-profile-main">

                            <div className="profile-avatar">

                                {(student?.fullName || "S")
                                    .charAt(0)
                                    .toUpperCase()}

                            </div>

                            <div>

                                <h3>
                                    {student?.fullName || "Student"}
                                </h3>

                                <p>
                                    {student?.email ||
                                        user?.username ||
                                        "—"}
                                </p>

                            </div>

                        </div>


                        {/* RIGHT — STUDENT DETAILS */}

                        <div className="student-dashboard-profile-details">

                            <div className="student-dashboard-profile-detail">

                                <span className="label">
                                    FULL NAME:
                                </span>

                                <strong className="value">
                                    {student?.fullName || "—"}
                                </strong>

                            </div>


                            <div className="student-dashboard-profile-detail">

                                <span className="label">
                                    EMAIL:
                                </span>

                                <strong className="value">
                                    {student?.email ||
                                        user?.username ||
                                        "—"}
                                </strong>

                            </div>


                            <div className="student-dashboard-profile-detail">

                                <span className="label">
                                    DEPARTMENT:
                                </span>

                                <strong className="value">
                                    {student?.department || "—"}
                                </strong>

                            </div>


                            <div className="student-dashboard-profile-detail">

                                <span className="label">
                                    YEAR:
                                </span>

                                <strong className="value">
                                    {student?.year || "—"}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {applicationCompany && (
                    <div
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget && applying === null) closeApplicationModal();
                        }}
                        style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(15,23,42,.58)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",backdropFilter:"blur(4px)"}}
                    >
                        <div style={{width:"100%",maxWidth:"720px",maxHeight:"90vh",overflowY:"auto",background:"#fff",borderRadius:"20px",boxShadow:"0 24px 70px rgba(15,23,42,.25)",padding:"30px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",gap:"20px",marginBottom:"24px"}}>
                                <div>
                                    <div style={{fontSize:"12px",fontWeight:800,letterSpacing:"1.4px",color:"#5146e5",marginBottom:"8px"}}>JOB APPLICATION</div>
                                    <h2 style={{margin:0,fontSize:"28px",color:"#172033"}}>Apply to {applicationCompany.companyName || applicationCompany.name || "Company"}</h2>
                                    <p style={{margin:"8px 0 0",color:"#667085",fontSize:"14px"}}>Submit your resume for this specific opportunity. You can use a different resume for every application.</p>
                                </div>
                                <button type="button" onClick={closeApplicationModal} disabled={applying !== null} style={{border:0,background:"#f3f4f8",width:"38px",height:"38px",borderRadius:"10px",fontSize:"24px",cursor:"pointer"}}>×</button>
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"12px",marginBottom:"26px"}}>
                                {[
                                    ["Role", applicationCompany.role || "Placement Opportunity"],
                                    ["Package", applicationCompany.package || applicationCompany.packageName || "Not specified"],
                                    ["Location", applicationCompany.location || "Not specified"],
                                    ["Eligibility", applicationCompany.eligibility || "Not specified"]
                                ].map(([label,value]) => (
                                    <div key={label} style={{background:"#f8f9fd",border:"1px solid #e8eaf2",borderRadius:"12px",padding:"14px 16px"}}>
                                        <div style={{fontSize:"11px",fontWeight:800,letterSpacing:".8px",color:"#7b8195",marginBottom:"5px"}}>{label.toUpperCase()}</div>
                                        <div style={{fontSize:"14px",fontWeight:700,color:"#1d2639"}}>{value}</div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={submitApplication}>
                                <div style={{border:"1.5px dashed #c9cde0",borderRadius:"16px",padding:"22px",background:"#fafaff"}}>
                                    <h3 style={{margin:0,color:"#172033",fontSize:"18px"}}>Upload Resume <span style={{color:"#e5484d"}}>*</span></h3>
                                    <p style={{margin:"5px 0 16px",color:"#667085",fontSize:"13px"}}>PDF only · Maximum 5 MB</p>
                                    <input id="student-resume-upload" type="file" accept="application/pdf,.pdf" onChange={handleResumeChange} style={{display:"none"}} />
                                    {!resumeFile ? (
                                        <label htmlFor="student-resume-upload" style={{minHeight:"150px",borderRadius:"12px",background:"#fff",border:"1px solid #e1e4ee",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",textAlign:"center",padding:"20px"}}>
                                            <div style={{width:"48px",height:"48px",borderRadius:"14px",background:"#eeecff",color:"#5146e5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",fontWeight:800,marginBottom:"10px"}}>↑</div>
                                            <strong style={{color:"#202a3d",fontSize:"15px"}}>Choose your resume</strong>
                                            <span style={{color:"#667085",fontSize:"13px",marginTop:"4px"}}>Browse files from your computer</span>
                                        </label>
                                    ) : (
                                        <div style={{background:"#fff",border:"1px solid #dfe3ef",borderRadius:"12px",padding:"14px",display:"flex",alignItems:"center",gap:"12px"}}>
                                            <div style={{width:"46px",height:"46px",borderRadius:"10px",background:"#fff0f0",color:"#d92d20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:900}}>PDF</div>
                                            <div style={{flex:1,minWidth:0}}><strong style={{display:"block",color:"#202a3d",fontSize:"14px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{resumeFile.name}</strong><span style={{color:"#667085",fontSize:"12px"}}>{(resumeFile.size/(1024*1024)).toFixed(2)} MB</span></div>
                                            <label htmlFor="student-resume-upload" style={{color:"#5146e5",fontWeight:700,fontSize:"13px",cursor:"pointer"}}>Change</label>
                                            <button type="button" onClick={removeResume} style={{border:0,background:"transparent",color:"#d92d20",fontWeight:700,fontSize:"13px",cursor:"pointer"}}>Remove</button>
                                        </div>
                                    )}
                                    {resumeError && <div style={{marginTop:"12px",padding:"10px 12px",borderRadius:"9px",background:"#fff1f0",color:"#c62828",fontSize:"13px",fontWeight:600}}>{resumeError}</div>}
                                    <div style={{marginTop:"14px",color:"#667085",fontSize:"12px"}}>ⓘ Your resume will be stored with this application.</div>
                                </div>
                                <div style={{display:"flex",justifyContent:"flex-end",gap:"10px",marginTop:"22px"}}>
                                    <button type="button" onClick={closeApplicationModal} disabled={applying !== null} style={{border:"1px solid #d8dbe6",background:"#fff",color:"#344054",borderRadius:"10px",padding:"12px 20px",fontWeight:700,cursor:"pointer"}}>Cancel</button>
                                    <button type="submit" disabled={!resumeFile || applying !== null} style={{border:0,background:!resumeFile || applying !== null ? "#b9b5f5" : "#5146e5",color:"#fff",borderRadius:"10px",padding:"12px 22px",fontWeight:800,cursor:!resumeFile || applying !== null ? "not-allowed" : "pointer"}}>{applying === applicationCompany.id ? "Submitting..." : "Submit Application"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </main>

        </div>
    );
}