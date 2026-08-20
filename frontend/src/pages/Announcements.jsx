import { useEffect, useState } from "react";
import api from "../services/api";

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        title: "",
        message: "",
    });

    const loadAnnouncements = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/announcements");

            setAnnouncements(response.data || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load announcements."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnnouncements();
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
            await api.post("/announcements", form);

            setForm({
                title: "",
                message: "",
            });

            setShowForm(false);

            await loadAnnouncements();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to create announcement."
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this announcement?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/announcements/${id}`);

            await loadAnnouncements();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to delete announcement."
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
                        Announcements
                    </h1>

                    <p className="page-description">
                        Share important updates and information
                        with students.
                    </p>
                </div>

                <div className="page-actions">

                    <button
                        className="secondary-button"
                        onClick={loadAnnouncements}
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
                        + New Announcement
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
                                Create Announcement
                            </h2>

                            <p>
                                Publish an important update for students.
                            </p>
                        </div>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="announcement-form">

                            <div className="form-group">

                                <label>
                                    Title
                                </label>

                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="e.g. TCS Placement Drive"
                                    maxLength={150}
                                    required
                                />

                                <span className="character-count">
                                    {form.title.length}/150
                                </span>

                            </div>

                            <div className="form-group">

                                <label>
                                    Message
                                </label>

                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    placeholder="Write your announcement here..."
                                    maxLength={5000}
                                    rows={7}
                                    required
                                />

                                <span className="character-count">
                                    {form.message.length}/5000
                                </span>

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
                                Publish Announcement
                            </button>

                        </div>

                    </form>

                </section>
            )}

            <section className="announcement-list-card">

                <div className="section-header">

                    <div>
                        <h2>
                            Published Announcements
                        </h2>

                        <p>
                            {announcements.length} announcements
                            published
                        </p>
                    </div>

                </div>

                {loading ? (
                    <div className="empty-state">
                        Loading announcements...
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="empty-state">

                        <div className="empty-icon">
                            ●
                        </div>

                        <strong>
                            No announcements yet
                        </strong>

                        <p>
                            Create your first campus announcement.
                        </p>

                    </div>
                ) : (
                    <div className="announcement-list">

                        {announcements.map((announcement) => (
                            <article
                                className="announcement-card"
                                key={announcement.id}
                            >

                                <div className="announcement-content">

                                    <div className="announcement-title-row">

                                        <div className="announcement-badge">
                                            ANNOUNCEMENT
                                        </div>

                                        <span className="announcement-id">
                                            #{announcement.id}
                                        </span>

                                    </div>

                                    <h3>
                                        {announcement.title}
                                    </h3>

                                    <p>
                                        {announcement.message}
                                    </p>

                                </div>

                                <button
                                    className="delete-button"
                                    onClick={() =>
                                        handleDelete(
                                            announcement.id
                                        )
                                    }
                                >
                                    Delete
                                </button>

                            </article>
                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}
