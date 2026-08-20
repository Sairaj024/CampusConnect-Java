import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function StudentProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editing, setEditing] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        department: "",
        year: "",
    });

    // =========================
    // GET STUDENT ID FROM JWT
    // =========================

    const getStudentIdFromToken = () => {
        try {
            const token = localStorage.getItem(
                "campusconnect_token"
            );

            if (!token) {
                return null;
            }

            const payload = JSON.parse(
                atob(
                    token
                        .split(".")[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

            return payload.userId || null;

        } catch (error) {
            console.error(
                "Unable to decode token:",
                error
            );

            return null;
        }
    };

    // =========================
    // GET STUDENT ID
    // =========================

    const getStudentId = () => {
        return (
            user?.studentId ||
            getStudentIdFromToken()
        );
    };

    // =========================
    // LOAD PROFILE
    // =========================

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const studentId = getStudentId();

            if (!studentId) {
                setError(
                    "Student information not found. Please logout and login again."
                );

                return;
            }

            const response = await api.get(
                `/students/${studentId}`
            );

            setStudent(response.data);

            setForm({
                fullName:
                    response.data?.fullName || "",

                email:
                    response.data?.email || "",

                department:
                    response.data?.department || "",

                year:
                    response.data?.year || "",
            });

        } catch (err) {
            console.error(
                "Profile loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load profile."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [user]);

    // =========================
    // HANDLE FORM CHANGE
    // =========================

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================
    // START EDITING
    // =========================

    const startEditing = () => {
        setError("");
        setSuccess("");

        setForm({
            fullName:
                student?.fullName || "",

            email:
                student?.email || "",

            department:
                student?.department || "",

            year:
                student?.year || "",
        });

        setEditing(true);
    };

    // =========================
    // CANCEL EDITING
    // =========================

    const cancelEditing = () => {
        setError("");
        setSuccess("");

        setForm({
            fullName:
                student?.fullName || "",

            email:
                student?.email || "",

            department:
                student?.department || "",

            year:
                student?.year || "",
        });

        setEditing(false);
    };

    // =========================
    // SAVE PROFILE
    // =========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const studentId = getStudentId();

        if (!studentId) {
            setError(
                "Student information not found. Please login again."
            );

            return;
        }

        if (
            !form.fullName.trim() ||
            !form.email.trim() ||
            !form.department.trim() ||
            !form.year.trim()
        ) {
            setError(
                "Please fill in all profile fields."
            );

            return;
        }

        try {
            setSaving(true);

            const response = await api.put(
                `/students/${studentId}`,
                {
                    fullName:
                        form.fullName.trim(),

                    email:
                        form.email.trim(),

                    department:
                        form.department.trim(),

                    year:
                        form.year.trim(),
                }
            );

            setStudent(response.data);

            setForm({
                fullName:
                    response.data?.fullName || "",

                email:
                    response.data?.email || "",

                department:
                    response.data?.department || "",

                year:
                    response.data?.year || "",
            });

            setEditing(false);

            setSuccess(
                "Profile updated successfully."
            );

        } catch (err) {
            console.error(
                "Profile update error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to update profile."
            );

        } finally {
            setSaving(false);
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="page-container">

                <div className="empty-state">
                    Loading profile...
                </div>

            </div>
        );
    }

    // =========================
    // ERROR WITHOUT PROFILE
    // =========================

    if (error && !student) {
        return (
            <div className="page-container">

                <div className="page-error">
                    {error}
                </div>

                <button
                    className="secondary-button"
                    onClick={() =>
                        navigate("/student")
                    }
                >
                    ← Back to Dashboard
                </button>

            </div>
        );
    }

    return (
        <div className="page-container">

            {/* =========================
                HEADER
            ========================= */}

            <div className="page-header">

                <div>

                    <p className="eyebrow">
                        STUDENT PORTAL
                    </p>

                    <h1>
                        My Profile
                    </h1>

                    <p className="page-description">
                        View and manage your student
                        information.
                    </p>

                </div>

                <div className="page-actions">

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate("/student")
                        }
                    >
                        ← Dashboard
                    </button>

                    {!editing && (
                        <button
                            className="primary-button"
                            onClick={startEditing}
                        >
                            Edit Profile
                        </button>
                    )}

                </div>

            </div>

            {/* =========================
                SUCCESS
            ========================= */}

            {success && (
                <div className="profile-success">
                    {success}
                </div>
            )}

            {/* =========================
                ERROR
            ========================= */}

            {error && student && (
                <div className="page-error">
                    {error}
                </div>
            )}

            {/* =========================
                PROFILE CARD
            ========================= */}

            <section className="student-profile-card">

                <div className="student-profile-header">

                    <div className="student-profile-avatar">
                        {student?.fullName
                            ?.charAt(0)
                            ?.toUpperCase() || "S"}
                    </div>

                    <div className="student-profile-heading">

                        <h2>
                            {student?.fullName || "—"}
                        </h2>

                        <p>
                            {student?.email || "—"}
                        </p>

                    </div>

                </div>

                {!editing ? (

                    /* =========================
                       VIEW MODE
                    ========================= */

                    <div className="student-profile-details">

                        <div className="student-profile-field">

                            <span>
                                Full Name
                            </span>

                            <strong>
                                {student?.fullName || "—"}
                            </strong>

                        </div>

                        <div className="student-profile-field">

                            <span>
                                Email
                            </span>

                            <strong>
                                {student?.email || "—"}
                            </strong>

                        </div>

                        <div className="student-profile-field">

                            <span>
                                Department
                            </span>

                            <strong>
                                {student?.department || "—"}
                            </strong>

                        </div>

                        <div className="student-profile-field">

                            <span>
                                Year
                            </span>

                            <strong>
                                {student?.year || "—"}
                            </strong>

                        </div>

                    </div>

                ) : (

                    /* =========================
                       EDIT MODE
                    ========================= */

                    <form
                        className="student-profile-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label htmlFor="profile-fullName">
                                Full Name
                            </label>

                            <input
                                id="profile-fullName"
                                name="fullName"
                                type="text"
                                value={form.fullName}
                                onChange={handleChange}
                                maxLength={100}
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="profile-email">
                                Email
                            </label>

                            <input
                                id="profile-email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                maxLength={150}
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="profile-department">
                                Department
                            </label>

                            <select
                                id="profile-department"
                                name="department"
                                value={form.department}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select your department
                                </option>

                                <option value="CSE">
                                    Computer Science & Engineering
                                </option>

                                <option value="IT">
                                    Information Technology
                                </option>

                                <option value="ENTC">
                                    Electronics & Telecommunication
                                </option>

                                <option value="ECE">
                                    Electronics & Communication
                                </option>

                                <option value="AI & DS">
                                    Artificial Intelligence & Data Science
                                </option>

                                <option value="AI & ML">
                                    Artificial Intelligence & Machine Learning
                                </option>

                                <option value="Mechanical">
                                    Mechanical Engineering
                                </option>

                                <option value="Civil">
                                    Civil Engineering
                                </option>

                                <option value="Electrical">
                                    Electrical Engineering
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>

                        <div className="form-group">

                            <label htmlFor="profile-year">
                                Year
                            </label>

                            <select
                                id="profile-year"
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select your year
                                </option>

                                <option value="First Year">
                                    First Year
                                </option>

                                <option value="Second Year">
                                    Second Year
                                </option>

                                <option value="Third Year">
                                    Third Year
                                </option>

                                <option value="Fourth Year">
                                    Fourth Year
                                </option>

                                <option value="Final Year">
                                    Final Year
                                </option>

                            </select>

                        </div>

                        <div className="student-profile-form-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={cancelEditing}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </form>

                )}

            </section>

        </div>
    );
}