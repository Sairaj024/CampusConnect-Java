import { useEffect, useState } from "react";
import api from "../services/api";

export default function Companies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        companyName: "",
        role: "",
        packageName: "",
        location: "",
        eligibility: "",
        applicationDeadline: "",
    });

    const loadCompanies = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/companies");
            setCompanies(response.data || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load companies."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        // =========================
        // VALIDATE DEADLINE
        // =========================

        if (!form.applicationDeadline) {
            setError(
                "Application deadline is required."
            );
            return;
        }

        const deadline = new Date(
            form.applicationDeadline
        );

        const now = new Date();

        if (deadline <= now) {
            setError(
                "Application deadline must be in the future."
            );
            return;
        }

        try {
            await api.post("/companies", form);

            setForm({
                companyName: "",
                role: "",
                packageName: "",
                location: "",
                eligibility: "",
                applicationDeadline: "",
            });

            setShowForm(false);

            await loadCompanies();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to create company."
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this company?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/companies/${id}`);

            await loadCompanies();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to delete company."
            );
        }
    };

    // =========================
    // FORMAT DEADLINE
    // =========================

    const formatDeadline = (deadline) => {
        if (!deadline) {
            return "—";
        }

        return new Date(deadline).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }
        );
    };

    return (
        <div className="page-container">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="page-header">

                <div>

                    <p className="eyebrow">
                        ADMIN PORTAL
                    </p>

                    <h1>
                        Companies
                    </h1>

                    <p className="page-description">
                        Manage placement opportunities
                        available to students.
                    </p>

                </div>

                <div className="page-actions">

                    <button
                        className="secondary-button"
                        onClick={loadCompanies}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="primary-button"
                        onClick={() =>
                            setShowForm(!showForm)
                        }
                    >
                        + Add Company
                    </button>

                </div>

            </div>


            {/* =========================
                ERROR
            ========================= */}

            {error && (
                <div className="page-error">
                    {error}
                </div>
            )}


            {/* =========================
                ADD COMPANY FORM
            ========================= */}

            {showForm && (

                <section className="company-form-card">

                    <div className="form-header">

                        <div>

                            <h2>
                                Add Company
                            </h2>

                            <p>
                                Create a new placement
                                opportunity.
                            </p>

                        </div>

                    </div>


                    <form onSubmit={handleSubmit}>

                        <div className="form-grid">

                            {/* COMPANY NAME */}

                            <div className="form-group">

                                <label htmlFor="companyName">
                                    Company Name
                                </label>

                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    value={
                                        form.companyName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. TCS"
                                    required
                                />

                            </div>


                            {/* ROLE */}

                            <div className="form-group">

                                <label htmlFor="role">
                                    Role
                                </label>

                                <input
                                    id="role"
                                    name="role"
                                    type="text"
                                    value={form.role}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Software Developer"
                                    required
                                />

                            </div>


                            {/* PACKAGE */}

                            <div className="form-group">

                                <label htmlFor="packageName">
                                    Package
                                </label>

                                <input
                                    id="packageName"
                                    name="packageName"
                                    type="text"
                                    value={
                                        form.packageName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 7 LPA"
                                    required
                                />

                            </div>


                            {/* LOCATION */}

                            <div className="form-group">

                                <label htmlFor="location">
                                    Location
                                </label>

                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={form.location}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Pune"
                                    required
                                />

                            </div>


                            {/* ELIGIBILITY */}

                            <div className="form-group">

                                <label htmlFor="eligibility">
                                    Eligibility
                                </label>

                                <input
                                    id="eligibility"
                                    name="eligibility"
                                    type="text"
                                    value={
                                        form.eligibility
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. B.Tech, 60%+"
                                    required
                                />

                            </div>


                            {/* APPLICATION DEADLINE */}

                            <div className="form-group">

                                <label
                                    htmlFor="applicationDeadline"
                                >
                                    Application Deadline
                                </label>

                                <input
                                    id="applicationDeadline"
                                    name="applicationDeadline"
                                    type="datetime-local"
                                    value={
                                        form.applicationDeadline
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                                <small className="form-help-text">
                                    Students will not be able
                                    to apply after this time.
                                </small>

                            </div>

                        </div>


                        {/* FORM ACTIONS */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                            >
                                Create Company
                            </button>

                        </div>

                    </form>

                </section>
            )}


            {/* =========================
                COMPANIES LIST
            ========================= */}

            <section className="companies-card">

                <div className="section-header">

                    <div>

                        <h2>
                            Placement Companies
                        </h2>

                        <p>
                            {companies.length} companies
                            currently listed
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
                            No companies found
                        </strong>

                        <p>
                            Add your first placement company.
                        </p>

                    </div>

                ) : (

                    <div className="companies-table-wrapper">

                        <table className="companies-table">

                            <thead>

                                <tr>

                                    <th>
                                        Company
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Package
                                    </th>

                                    <th>
                                        Location
                                    </th>

                                    <th>
                                        Eligibility
                                    </th>

                                    <th>
                                        Application Deadline
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {companies.map(
                                    (company) => (

                                        <tr
                                            key={company.id}
                                        >

                                            <td>

                                                <strong className="company-name">
                                                    {
                                                        company.companyName
                                                    }
                                                </strong>

                                            </td>


                                            <td>
                                                {
                                                    company.role
                                                }
                                            </td>


                                            <td>

                                                <span className="package-badge">
                                                    {
                                                        company.packageName
                                                    }
                                                </span>

                                            </td>


                                            <td>
                                                {
                                                    company.location
                                                }
                                            </td>


                                            <td>
                                                {
                                                    company.eligibility
                                                }
                                            </td>


                                            <td>

                                                {formatDeadline(
                                                    company.applicationDeadline
                                                )}

                                            </td>


                                            <td>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            company.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    );
}