import "./App.css";

import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

import Login from "./pages/Login";

import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";

import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/Students";
import Companies from "./pages/Companies";
import Applications from "./pages/Applications";
import Announcements from "./pages/Announcements";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>

                <Routes>

                    {/* DEFAULT */}
                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />

                    {/* LOGIN */}
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    {/* =========================
                        STUDENT ROUTES
                    ========================= */}

                    <Route
                        path="/student"
                        element={
                            <ProtectedRoute allowedRole="STUDENT">
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/student/profile"
                        element={
                            <ProtectedRoute allowedRole="STUDENT">
                                <StudentProfile />
                            </ProtectedRoute>
                        }
                    />

                    {/* =========================
                        ADMIN ROUTES
                    ========================= */}

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRole="ADMIN">
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >

                        {/* Dashboard */}
                        <Route
                            index
                            element={<AdminDashboard />}
                        />

                        {/* Students */}
                        <Route
                            path="students"
                            element={<Students />}
                        />

                        {/* Companies */}
                        <Route
                            path="companies"
                            element={<Companies />}
                        />

                        {/* Applications */}
                        <Route
                            path="applications"
                            element={<Applications />}
                        />

                        {/* Announcements */}
                        <Route
                            path="announcements"
                            element={<Announcements />}
                        />

                    </Route>

                    {/* UNKNOWN ROUTE */}
                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>

            </AuthProvider>
        </BrowserRouter>
    );
}