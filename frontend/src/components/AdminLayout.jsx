import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navItems = [
        {
            label: "Dashboard",
            path: "/admin",
            icon: "⌂",
            end: true,
        },
        {
            label: "Students",
            path: "/admin/students",
            icon: "♙",
        },
        {
            label: "Companies",
            path: "/admin/companies",
            icon: "▣",
        },
        {
            label: "Applications",
            path: "/admin/applications",
            icon: "✓",
        },
        {
            label: "Announcements",
            path: "/admin/announcements",
            icon: "●",
        },
    ];

    return (
        <div className="admin-shell">

            {/* SIDEBAR */}
            <aside className="admin-sidebar">

                <div className="sidebar-brand">
                    <div className="brand-icon">
                        CC
                    </div>

                    <div>
                        <div className="brand-name">
                            CampusConnect
                        </div>

                        <div className="brand-subtitle">
                            Placement Portal
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `nav-item ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >
                            <span className="nav-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>
                        </NavLink>
                    ))}

                </nav>

                <div className="sidebar-bottom">

                    <div className="admin-profile">

                        <div className="profile-avatar">
                            {(
                                user?.name ||
                                user?.username ||
                                "A"
                            )
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="profile-info">

                            <strong>
                                {user?.name ||
                                    user?.username ||
                                    "Admin"}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        ↪ Logout
                    </button>

                </div>

            </aside>

            {/* PAGE CONTENT */}
            <main className="admin-shell-main">
                <Outlet />
            </main>

        </div>
    );
}