import { useEffect, useState } from "react";
import api from "../services/api";

export default function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        department: "",
        year: "",
    });

    const loadStudents = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/students");
            setStudents(response.data || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load students."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
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

        try {
            await api.post("/students", form);

            setForm({
                fullName: "",
                email: "",
                password: "",
                department: "",
                year: "",
            });

            setShowForm(false);

            await loadStudents();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to create student."
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/students/${id}`);

            await loadStudents();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to delete student."
            );
        }
    };

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <p className="eyebrow">
                        ADMIN PORTAL
                    </p>

                    <h1>
                        Students
                    </h1>

                    <p className="page-description">
                        Manage students registered on CampusConnect.
                    </p>
                </div>

                <div className="page-actions">

                    <button
                        className="secondary-button"
                        onClick={loadStudents}
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
                        + Add Student
                    </button>

                </div>

            </div>

            {error && (
                <div className="page-error">
                    {error}
                </div>
            )}

            {showForm && (
                <section className="company-form-card">

                    <div className="form-header">

                        <div>
                            <h2>
                                Add Student
                            </h2>

                            <p>
                                Register a new student on the placement portal.
                            </p>
                        </div>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="form-grid">

                            <div className="form-group">
                                <label>
                                    Full Name
                                </label>

                                <input
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    placeholder="e.g. Sairaj Deshmukh"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="student@example.com"
                                    maxLength={150}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Minimum 8 characters"
                                    minLength={8}
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Department
                                </label>

                                <input
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    placeholder="e.g. Computer Science"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Year
                                </label>

                                <input
                                    name="year"
                                    value={form.year}
                                    onChange={handleChange}
                                    placeholder="e.g. Final Year"
                                    maxLength={50}
                                    required
                                />
                            </div>

                        </div>

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
                                Create Student
                            </button>

                        </div>

                    </form>

                </section>
            )}

            <section className="companies-card">

                <div className="section-header">

                    <div>
                        <h2>
                            Registered Students
                        </h2>

                        <p>
                            {students.length} students registered
                        </p>
                    </div>

                </div>

                {loading ? (
                    <div className="empty-state">
                        Loading students...
                    </div>
                ) : students.length === 0 ? (
                    <div className="empty-state">

                        <div className="empty-icon">
                            ♙
                        </div>

                        <strong>
                            No students found
                        </strong>

                        <p>
                            Add your first student.
                        </p>

                    </div>
                ) : (
                    <div className="companies-table-wrapper">

                        <table className="companies-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Student</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Year</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {students.map((student) => (
                                    <tr key={student.id}>

                                        <td>
                                            #{student.id}
                                        </td>

                                        <td>
                                            <strong className="company-name">
                                                {student.fullName}
                                            </strong>
                                        </td>

                                        <td>
                                            {student.email}
                                        </td>

                                        <td>
                                            {student.department}
                                        </td>

                                        <td>
                                            {student.year}
                                        </td>

                                        <td>
                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    handleDelete(
                                                        student.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

        </div>
    );
}
