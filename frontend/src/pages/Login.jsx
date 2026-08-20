import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {

    const {
        user,
        login,
        registerStudent,
        loading,
    } = useAuth();

    const navigate = useNavigate();

    const [role, setRole] = useState("ADMIN");
    const [mode, setMode] = useState("LOGIN");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [fullName, setFullName] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (user) {
        return (
            <Navigate
                to={
                    user.role === "ADMIN"
                        ? "/admin"
                        : "/student"
                }
                replace
            />
        );
    }

    const handleRoleChange = (selectedRole) => {

        setRole(selectedRole);
        setMode("LOGIN");

        setUsername("");
        setPassword("");

        setFullName("");
        setDepartment("");
        setYear("");
        setConfirmPassword("");

        setError("");
        setSuccess("");
    };

    const switchMode = (newMode) => {

        setMode(newMode);

        setUsername("");
        setPassword("");

        setFullName("");
        setDepartment("");
        setYear("");
        setConfirmPassword("");

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        // =========================
        // STUDENT REGISTRATION
        // =========================

        if (
            role === "STUDENT" &&
            mode === "REGISTER"
        ) {

            if (!fullName.trim()) {
                setError("Please enter your full name.");
                return;
            }

            if (!username.trim()) {
                setError("Please enter your email.");
                return;
            }

            if (!department.trim()) {
                setError("Please enter your department.");
                return;
            }

            if (!year.trim()) {
                setError("Please select your year.");
                return;
            }

            if (password.length < 6) {
                setError(
                    "Password must be at least 6 characters."
                );
                return;
            }

            if (password !== confirmPassword) {
                setError(
                    "Passwords do not match."
                );
                return;
            }

            const result =
                await registerStudent({
                    fullName: fullName.trim(),
                    email: username.trim(),
                    password,
                    department: department.trim(),
                    year: year.trim(),
                });

            if (!result.success) {
                setError(result.message);
                return;
            }

            setSuccess(
                "Account created successfully. You can now sign in."
            );

            setMode("LOGIN");

            setFullName("");
            setDepartment("");
            setYear("");
            setPassword("");
            setConfirmPassword("");

            return;
        }

        // =========================
        // LOGIN
        // =========================

        if (!username.trim() || !password.trim()) {

            setError(
                role === "STUDENT"
                    ? "Please enter your email and password."
                    : "Please enter your username and password."
            );

            return;
        }

        const result = await login(
            username.trim(),
            password,
            role
        );

        if (!result.success) {
            setError(result.message);
            return;
        }

        if (result.user.role === "ADMIN") {
            navigate("/admin");
            return;
        }

        if (result.user.role === "STUDENT") {
            navigate("/student");
            return;
        }

        setError("Unknown user role.");
    };

    const isRegister =
        role === "STUDENT" &&
        mode === "REGISTER";

    return (
        <div className="login-page">

            {/* LEFT SIDE */}

            <div className="login-left">

                <div className="brand">

                    <div className="brand-logo">
                        CC
                    </div>

                    <span>
                        CampusConnect
                    </span>

                </div>

                <div className="hero-content">

                    <span className="eyebrow">
                        CAMPUS PLACEMENT PLATFORM
                    </span>

                    <h1>
                        Your campus.
                        <br />
                        Your career.
                        <br />

                        <span>
                            Connected.
                        </span>
                    </h1>

                    <p>
                        Discover opportunities, apply to
                        companies, track your applications,
                        and stay updated with everything
                        happening on campus.
                    </p>

                </div>

            </div>

            {/* RIGHT SIDE */}

            <div className="login-right">

                <div className="login-card">

                    <div className="mobile-brand">

                        <div className="brand-logo">
                            CC
                        </div>

                        <span>
                            CampusConnect
                        </span>

                    </div>

                    <div className="login-heading">

                        <span>
                            {isRegister
                                ? "WELCOME TO CAMPUSCONNECT"
                                : "WELCOME BACK"}
                        </span>

                        <h2>
                            {isRegister
                                ? "Create your student account"
                                : "Sign in to CampusConnect"}
                        </h2>

                        <p>
                            {isRegister
                                ? "Register to access your placement portal."
                                : "Access your placement portal."}
                        </p>

                    </div>

                    {/* ROLE SELECTOR */}

                    <div className="role-selector">

                        <button
                            type="button"
                            className={
                                role === "ADMIN"
                                    ? "role-button active"
                                    : "role-button"
                            }
                            onClick={() =>
                                handleRoleChange("ADMIN")
                            }
                        >
                            Admin
                        </button>

                        <button
                            type="button"
                            className={
                                role === "STUDENT"
                                    ? "role-button active"
                                    : "role-button"
                            }
                            onClick={() =>
                                handleRoleChange("STUDENT")
                            }
                        >
                            Student
                        </button>

                    </div>

                    {/* STUDENT MODE SWITCH */}

                    {role === "STUDENT" && (
                        <div
                            className="role-selector"
                            style={{
                                marginTop: "12px",
                            }}
                        >

                            <button
                                type="button"
                                className={
                                    mode === "LOGIN"
                                        ? "role-button active"
                                        : "role-button"
                                }
                                onClick={() =>
                                    switchMode("LOGIN")
                                }
                            >
                                Sign In
                            </button>

                            <button
                                type="button"
                                className={
                                    mode === "REGISTER"
                                        ? "role-button active"
                                        : "role-button"
                                }
                                onClick={() =>
                                    switchMode("REGISTER")
                                }
                            >
                                Sign Up
                            </button>

                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* REGISTRATION FIELDS */}

                        {isRegister && (
                            <>
                                <div className="form-group">

                                    <label htmlFor="fullName">
                                        Full Name
                                    </label>

                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(event) =>
                                            setFullName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                    />

                                </div>

                                <div className="form-group">

                                <label htmlFor="department">
                                    Department
                                </label>

                                <select
                                    id="department"
                                    value={department}
                                    onChange={(event) =>
                                        setDepartment(event.target.value)
                                    }
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

                                    <label htmlFor="year">
                                        Year
                                    </label>

                                    <select
                                        id="year"
                                        value={year}
                                        onChange={(event) =>
                                            setYear(
                                                event.target.value
                                            )
                                        }
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

                                    </select>

                                </div>
                            </>
                        )}

                        {/* EMAIL */}

                        <div className="form-group">

                            <label htmlFor="username">
                                {role === "STUDENT"
                                    ? "Email"
                                    : "Username"}
                            </label>

                            <input
                                id="username"
                                type={
                                    role === "STUDENT"
                                        ? "email"
                                        : "text"
                                }
                                value={username}
                                onChange={(event) =>
                                    setUsername(
                                        event.target.value
                                    )
                                }
                                placeholder={
                                    role === "STUDENT"
                                        ? "Enter your email"
                                        : "Enter your username"
                                }
                                autoComplete={
                                    role === "STUDENT"
                                        ? "email"
                                        : "username"
                                }
                            />

                        </div>

                        {/* PASSWORD */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your password"
                                autoComplete={
                                    isRegister
                                        ? "new-password"
                                        : "current-password"
                                }
                            />

                        </div>

                        {/* CONFIRM PASSWORD */}

                        {isRegister && (
                            <div className="form-group">

                                <label htmlFor="confirmPassword">
                                    Confirm Password
                                </label>

                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                />

                            </div>
                        )}

                        {/* ERROR */}

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        {/* SUCCESS */}

                        {success && (
                            <div
                                className="login-success"
                            >
                                {success}
                            </div>
                        )}

                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? isRegister
                                    ? "Creating account..."
                                    : "Signing in..."
                                : isRegister
                                    ? "Create Student Account"
                                    : `Sign in as ${
                                        role === "ADMIN"
                                            ? "Admin"
                                            : "Student"
                                    }`}
                        </button>

                    </form>

                    {/* FOOTER */}

                    <div className="login-footer">

                        <span>
                            CampusConnect Placement
                            Management System
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}
