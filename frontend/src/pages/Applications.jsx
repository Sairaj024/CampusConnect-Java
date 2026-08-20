import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function Applications() {

    const [searchParams] = useSearchParams();

    const companyId =
        searchParams.get("companyId");

    const [applications, setApplications] =
        useState([]);

    const [students, setStudents] =
        useState([]);

    const [companies, setCompanies] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [exporting, setExporting] =
        useState(false);

    const [error, setError] =
        useState("");

    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    const loadApplications = async () => {

        setLoading(true);
        setError("");

        try {

            const [
                applicationsResponse,
                studentsResponse,
                companiesResponse,
            ] = await Promise.all([

                api.get("/applications"),

                api.get("/students"),

                api.get("/companies"),

            ]);

            const applicationData =
                applicationsResponse.data || [];

            const studentData =
                studentsResponse.data || [];

            const companyData =
                companiesResponse.data || [];

            // =================================================
            // FILTER BY COMPANY
            // =================================================

            const filteredApplications =
                companyId
                    ? applicationData.filter(
                        (application) =>
                            Number(
                                application.companyId
                            ) ===
                            Number(companyId)
                    )
                    : applicationData;

            // =================================================
            // SORT NEWEST FIRST
            // =================================================

            const sortedApplications =
                [...filteredApplications].sort(
                    (a, b) =>
                        new Date(
                            b.appliedAt || 0
                        ) -
                        new Date(
                            a.appliedAt || 0
                        )
                );

            setApplications(
                sortedApplications
            );

            setStudents(
                studentData
            );

            setCompanies(
                companyData
            );

        } catch (err) {

            console.error(
                "Applications loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load applications."
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadApplications();

    }, [companyId]);


    // =====================================================
    // DELETE APPLICATION
    // =====================================================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this application?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `/applications/${id}`
            );

            await loadApplications();

        } catch (err) {

            console.error(
                "Delete application error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to delete application."
            );
        }
    };


    // =====================================================
    // GET STUDENT
    // =====================================================

    const getStudent = (studentId) => {

        return students.find(
            (student) =>
                Number(student.id) ===
                Number(studentId)
        );
    };


    // =====================================================
    // GET COMPANY
    // =====================================================

    const getCompany = (companyIdValue) => {

        return companies.find(
            (company) =>
                Number(company.id) ===
                Number(companyIdValue)
        );
    };


    // =====================================================
    // SELECTED COMPANY
    //
    // IMPORTANT:
    // This MUST be before handleExport because
    // handleExport uses selectedCompany.
    // =====================================================

    const selectedCompany =
        companyId
            ? getCompany(companyId)
            : null;


    // =====================================================
    // VIEW / DOWNLOAD RESUME
    // =====================================================

    const handleViewResume = async (
        applicationId
    ) => {

        try {

            const response =
                await api.get(
                    `/applications/${applicationId}/resume`,
                    {
                        responseType:
                            "blob",
                    }
                );

            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            response.headers[
                                "content-type"
                            ] ||
                            "application/pdf",
                    }
                );

            const url =
                window.URL.createObjectURL(
                    blob
                );

            window.open(
                url,
                "_blank"
            );

            setTimeout(() => {

                window.URL.revokeObjectURL(
                    url
                );

            }, 10000);

        } catch (err) {

            console.error(
                "Resume loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to open resume."
            );
        }
    };


    // =====================================================
    // EXPORT APPLICATIONS ZIP
    //
    // ALL APPLICATIONS:
    // /applications/export
    //
    // COMPANY APPLICATIONS:
    // /applications/export?companyId=6
    // =====================================================

    const handleExport = async () => {

        try {

            setExporting(true);

            setError("");

            const endpoint =
                companyId
                    ? `/applications/export?companyId=${companyId}`
                    : "/applications/export";

            console.log(
                "Exporting applications from:",
                endpoint
            );

            const response =
                await api.get(
                    endpoint,
                    {
                        responseType:
                            "blob",
                    }
                );

            // =================================================
            // CHECK RESPONSE
            // =================================================

            if (
                !response.data ||
                response.data.size === 0
            ) {

                throw new Error(
                    "The server returned an empty ZIP file."
                );
            }


            // =================================================
            // CREATE ZIP BLOB
            // =================================================

            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            response.headers[
                                "content-type"
                            ] ||
                            "application/zip",
                    }
                );


            // =================================================
            // CREATE DOWNLOAD URL
            // =================================================

            const url =
                window.URL.createObjectURL(
                    blob
                );


            // =================================================
            // FILE NAME
            // =================================================

            let filename;

            if (
                selectedCompany &&
                selectedCompany.companyName
            ) {

                filename =
                    selectedCompany.companyName
                        .replace(
                            /[^a-z0-9]/gi,
                            "-"
                        )
                        .replace(
                            /-+/g,
                            "-"
                        )
                        .replace(
                            /^-|-$/g,
                            ""
                        )
                        .toLowerCase();

                filename +=
                    "-applications.zip";

            } else {

                filename =
                    "campusconnect-applications.zip";
            }


            // =================================================
            // CREATE DOWNLOAD LINK
            // =================================================

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                filename;

            document.body.appendChild(
                link
            );

            link.click();


            // =================================================
            // CLEAN UP
            // =================================================

            document.body.removeChild(
                link
            );

            setTimeout(() => {

                window.URL.revokeObjectURL(
                    url
                );

            }, 1000);

        } catch (err) {

            console.error(
                "Export applications error:",
                err
            );

            if (
                err.response &&
                err.response.status
            ) {

                setError(
                    `Unable to export applications. Server returned ${err.response.status}.`
                );

            } else {

                setError(
                    err.message ||
                    "Unable to export applications."
                );
            }

        } finally {

            setExporting(false);
        }
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        return new Date(
            date
        ).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="page-container">

            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <div className="page-header">

                <div>

                    <p className="eyebrow">
                        ADMIN PORTAL
                    </p>

                    <h1>

                        {selectedCompany
                            ? `${selectedCompany.companyName} Applicants`
                            : "Applications"}

                    </h1>

                    <p className="page-description">

                        {selectedCompany
                            ? `Students who applied to ${selectedCompany.companyName}.`
                            : "Monitor student applications for placement opportunities."}

                    </p>

                </div>


                {/* =================================================
                    PAGE ACTIONS
                ================================================== */}

                <div className="page-actions">

                    {/* REFRESH */}

                    <button
                        className="secondary-button"
                        onClick={
                            loadApplications
                        }
                        disabled={
                            loading ||
                            exporting
                        }
                    >

                        ↻ Refresh

                    </button>


                    {/* EXPORT */}

                    <button
                        className="primary-button"
                        onClick={
                            handleExport
                        }
                        disabled={
                            exporting ||
                            loading ||
                            applications.length === 0
                        }
                    >

                        {exporting
                            ? "Preparing ZIP..."
                            : selectedCompany
                            ? `↓ Export ${selectedCompany.companyName}`
                            : "↓ Export All Applications"}

                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="page-error">

                    {error}

                </div>

            )}


            {/* =================================================
                APPLICATIONS CARD
            ================================================== */}

            <section className="companies-card">

                <div className="section-header">

                    <div>

                        <h2>

                            {selectedCompany
                                ? `${selectedCompany.companyName} Applicants`
                                : "All Applications"}

                        </h2>

                        <p>

                            {applications.length}{" "}

                            {applications.length === 1
                                ? "application"
                                : "applications"}

                            {" "}submitted

                        </p>

                    </div>

                </div>


                {/* =================================================
                    LOADING
                ================================================== */}

                {loading ? (

                    <div className="empty-state">

                        Loading applications...

                    </div>


                ) : applications.length === 0 ? (

                    /* =================================================
                       NO APPLICATIONS
                    ================================================== */

                    <div className="empty-state">

                        <div className="empty-icon">
                            ✓
                        </div>

                        <strong>

                            {selectedCompany
                                ? `No students have applied to ${selectedCompany.companyName}`
                                : "No applications found"}

                        </strong>

                        <p>

                            {selectedCompany
                                ? "Applications from students will appear here."
                                : "Student applications will appear here."}

                        </p>

                    </div>


                ) : (

                    /* =================================================
                       APPLICATION TABLE
                    ================================================== */

                    <div className="companies-table-wrapper">

                        <table className="companies-table">

                            <thead>

                                <tr>

                                    <th>
                                        Application
                                    </th>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Company
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Applied On
                                    </th>

                                    <th>
                                        Resume
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {applications.map(
                                    (application) => {

                                        const student =
                                            getStudent(
                                                application.studentId
                                            );

                                        const company =
                                            getCompany(
                                                application.companyId
                                            );

                                        return (

                                            <tr
                                                key={
                                                    application.id
                                                }
                                            >

                                                {/* APPLICATION ID */}

                                                <td>

                                                    <strong
                                                        className="company-name"
                                                    >

                                                        APP-
                                                        {String(
                                                            application.id
                                                        ).padStart(
                                                            4,
                                                            "0"
                                                        )}

                                                    </strong>

                                                </td>


                                                {/* STUDENT */}

                                                <td>

                                                    <div>

                                                        <strong>

                                                            {student?.fullName ||
                                                                `Student #${application.studentId}`}

                                                        </strong>

                                                        {student && (

                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                    color:
                                                                        "#8a94a6",
                                                                    marginTop:
                                                                        "4px",
                                                                }}
                                                            >

                                                                {student.department}
                                                                {" • "}
                                                                {student.year}

                                                            </div>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* EMAIL */}

                                                <td>

                                                    {student?.email ||
                                                        "—"}

                                                </td>


                                                {/* COMPANY */}

                                                <td>

                                                    <strong>

                                                        {company?.companyName ||
                                                            `Company #${application.companyId}`}

                                                    </strong>

                                                </td>


                                                {/* ROLE */}

                                                <td>

                                                    {company?.role ||
                                                        "—"}

                                                </td>


                                                {/* APPLIED DATE */}

                                                <td>

                                                    {formatDate(
                                                        application.appliedAt
                                                    )}

                                                </td>


                                                {/* RESUME */}

                                                <td>

                                                    <button
                                                        className="view-resume-button"
                                                        onClick={() =>
                                                            handleViewResume(
                                                                application.id
                                                            )
                                                        }
                                                    >

                                                        View Resume

                                                    </button>

                                                </td>


                                                {/* DELETE */}

                                                <td>

                                                    <button
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                application.id
                                                            )
                                                        }
                                                    >

                                                        Delete

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

            </section>

        </div>
    );
}