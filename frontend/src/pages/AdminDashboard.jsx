import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        students: 0,
        companies: 0,
        applications: 0,
        announcements: 0,
    });

    const [companies, setCompanies] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [allApplications, setAllApplications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const [
                studentsResponse,
                companiesResponse,
                applicationsResponse,
                announcementsResponse,
            ] = await Promise.all([
                api.get("/students"),
                api.get("/companies"),
                api.get("/applications"),
                api.get("/announcements"),
            ]);

            const students = studentsResponse.data || [];
            const companiesData = companiesResponse.data || [];
            const applications = applicationsResponse.data || [];
            const announcements = announcementsResponse.data || [];

            setCompanies(companiesData);
            setAllApplications(applications);

            setStats({
                students: students.length,
                companies: companiesData.length,
                applications: applications.length,
                announcements: announcements.length,
            });

            const sortedApplications = [...applications]
                .sort((a, b) => {
                    return (
                        new Date(b.appliedAt || 0) -
                        new Date(a.appliedAt || 0)
                    );
                })
                .slice(0, 5);

            setRecentApplications(sortedApplications);
        } catch (err) {
            console.error("Dashboard loading error:", err);

            setError(
                err.response?.data?.message ||
                    "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getApplicantCount = (companyId) => {
        return allApplications.filter(
            (application) =>
                Number(application.companyId) === Number(companyId)
        ).length;
    };

    const viewCompanyApplicants = (company) => {
        navigate(
            `/admin/applications?companyId=${company.id}`
        );
    };

    return (
        <div className="admin-dashboard-page">

            {/* =========================
                HEADER
            ========================= */}

            <header className="dashboard-header">

                <div>
                    <p className="eyebrow">
                        ADMIN PORTAL
                    </p>

                    <h1>
                        Dashboard
                    </h1>

                    <p className="header-description">
                        Manage your campus placement activities
                        from one place.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    ↻
                    {loading ? " Loading..." : " Refresh"}
                </button>

            </header>

            {/* =========================
                ERROR
            ========================= */}

            {error && (
                <div className="dashboard-error">
                    <strong>
                        Unable to load data
                    </strong>

                    <span>
                        {error}
                    </span>
                </div>
            )}

            {/* =========================
                STATISTICS
            ========================= */}

            <section className="stats-grid">

                {/* STUDENTS */}

                <div className="stat-card">

                    <div className="stat-card-top">

                        <div className="stat-card-heading">
                            <span className="stat-label">
                                Total Students
                            </span>
                        </div>

                        <div className="stat-icon students-icon">
                            ♙
                        </div>

                    </div>

                    <div className="stat-card-bottom">

                        <div className="stat-number">
                            {loading
                                ? "—"
                                : stats.students}
                        </div>

                        <div className="stat-description">
                            Registered students
                        </div>

                    </div>

                </div>

                {/* COMPANIES */}

                <div className="stat-card">

                    <div className="stat-card-top">

                        <div className="stat-card-heading">
                            <span className="stat-label">
                                Companies
                            </span>
                        </div>

                        <div className="stat-icon companies-icon">
                            ▣
                        </div>

                    </div>

                    <div className="stat-card-bottom">

                        <div className="stat-number">
                            {loading
                                ? "—"
                                : stats.companies}
                        </div>

                        <div className="stat-description">
                            Placement opportunities
                        </div>

                    </div>

                </div>

                {/* APPLICATIONS */}

                <div className="stat-card">

                    <div className="stat-card-top">

                        <div className="stat-card-heading">
                            <span className="stat-label">
                                Applications
                            </span>
                        </div>

                        <div className="stat-icon applications-icon">
                            ✓
                        </div>

                    </div>

                    <div className="stat-card-bottom">

                        <div className="stat-number">
                            {loading
                                ? "—"
                                : stats.applications}
                        </div>

                        <div className="stat-description">
                            Total applications
                        </div>

                    </div>

                </div>

                {/* ANNOUNCEMENTS */}

                <div className="stat-card">

                    <div className="stat-card-top">

                        <div className="stat-card-heading">
                            <span className="stat-label">
                                Announcements
                            </span>
                        </div>

                        <div className="stat-icon announcements-icon">
                            ●
                        </div>

                    </div>

                    <div className="stat-card-bottom">

                        <div className="stat-number">
                            {loading
                                ? "—"
                                : stats.announcements}
                        </div>

                        <div className="stat-description">
                            Campus updates
                        </div>

                    </div>

                </div>

            </section>

            {/* =========================
                PLACEMENT COMPANIES
            ========================= */}

            <section className="dashboard-section company-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Placement Companies
                        </h2>

                        <p>
                            View companies and their student
                            applications.
                        </p>

                    </div>

                </div>

                {loading ? (

                    <div className="empty-state">
                        Loading companies...
                    </div>

                ) : companies.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            ▣
                        </div>

                        <strong>
                            No companies yet
                        </strong>

                        <p>
                            Add companies to start managing
                            placement applications.
                        </p>

                    </div>

                ) : (

                    <div className="company-cards-grid">

                        {companies.map((company) => {

                            const applicantCount =
                                getApplicantCount(company.id);

                            return (
                                <div
                                    className="company-admin-card"
                                    key={company.id}
                                >

                                    <div className="company-admin-card-top">

                                        <div className="company-admin-icon">
                                            ▣
                                        </div>

                                        <div>
                                            <h3>
                                                {company.companyName ||
                                                    "Unnamed Company"}
                                            </h3>

                                            <p>
                                                {company.role ||
                                                    "Placement Opportunity"}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="company-admin-details">

                                    <div className="company-admin-meta">

                                        <span className="company-admin-location">
                                            📍{" "}
                                            {company.location ||
                                                "Location not specified"}
                                        </span>

                                        <span className="company-admin-applicants">
                                            👥{" "}
                                            {applicantCount}{" "}
                                            {applicantCount === 1
                                            ? "Applicant"
                                            : "Applicants"}
                                        </span>

                                    </div>

                                    {company.applicationDeadline && (
                                        <div className="company-admin-deadline">

                                            <span className="deadline-label">
                                                Application Deadline
                                            </span>

                                            <strong>
                                                {new Date(
                                                    company.applicationDeadline
                                                ).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true
                                                })}
                                            </strong>

                                        </div>
                                    )}

                                </div>

                                    <button
                                        type="button"
                                        className="company-admin-button"
                                        onClick={() =>
                                            viewCompanyApplicants(
                                                company
                                            )
                                        }
                                    >
                                        <span>
                                            View Applicants
                                        </span>

                                        <span>
                                            →
                                        </span>
                                    </button>

                                </div>
                            );
                        })}

                    </div>

                )}

            </section>

            {/* =========================
                RECENT APPLICATIONS
            ========================= */}

            <section className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Recent Applications
                        </h2>

                        <p>
                            Latest placement applications
                        </p>

                    </div>

                </div>

                <div className="applications-table-wrapper">

                    {loading ? (

                        <div className="empty-state">
                            Loading applications...
                        </div>

                    ) : recentApplications.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ✓
                            </div>

                            <strong>
                                No applications yet
                            </strong>

                            <p>
                                Applications will appear here
                                when students apply to companies.
                            </p>

                        </div>

                    ) : (

                        <table className="applications-table">

                            <thead>

                                <tr>
                                    <th>
                                        Application
                                    </th>

                                    <th>
                                        Student ID
                                    </th>

                                    <th>
                                        Company ID
                                    </th>

                                    <th>
                                        Applied On
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {recentApplications.map(
                                    (application) => (

                                        <tr
                                            key={
                                                application.id
                                            }
                                        >

                                            <td>
                                                <span className="application-id">
                                                    APP-
                                                    {String(
                                                        application.id
                                                    ).padStart(
                                                        4,
                                                        "0"
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                Student #
                                                {
                                                    application.studentId
                                                }
                                            </td>

                                            <td>
                                                Company #
                                                {
                                                    application.companyId
                                                }
                                            </td>

                                            <td>
                                                {formatDate(
                                                    application.appliedAt
                                                )}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    )}

                </div>

            </section>

            {/* =========================
                QUICK ACTIONS
            ========================= */}

            <section className="quick-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Quick Actions
                        </h2>

                        <p>
                            Common administration tasks
                        </p>

                    </div>

                </div>

                <div className="quick-grid">

                    <button
                        type="button"
                        className="quick-card"
                        onClick={() =>
                            navigate("/admin/companies")
                        }
                    >

                        <div className="quick-icon">
                            +
                        </div>

                        <div>

                            <strong>
                                Add Company
                            </strong>

                            <p>
                                Create a new placement
                                opportunity.
                            </p>

                        </div>

                    </button>

                    <button
                        type="button"
                        className="quick-card"
                        onClick={() =>
                            navigate("/admin/announcements")
                        }
                    >

                        <div className="quick-icon">
                            +
                        </div>

                        <div>

                            <strong>
                                Create Announcement
                            </strong>

                            <p>
                                Share an important campus
                                update.
                            </p>

                        </div>

                    </button>

                    <button
                        type="button"
                        className="quick-card"
                        onClick={() =>
                            navigate("/admin/applications")
                        }
                    >

                        <div className="quick-icon">
                            →
                        </div>

                        <div>

                            <strong>
                                View Applications
                            </strong>

                            <p>
                                Review student applications.
                            </p>

                        </div>

                    </button>

                </div>

            </section>

        </div>
    );
}