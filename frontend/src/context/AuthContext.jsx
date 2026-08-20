import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {

        try {
            const savedUser =
                localStorage.getItem(
                    "campusconnect_user"
                );

            return savedUser
                ? JSON.parse(savedUser)
                : null;

        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(false);

    const login = async (
        username,
        password,
        role = "ADMIN"
    ) => {

        setLoading(true);

        try {

            const endpoint =
                role === "STUDENT"
                    ? "/auth/student-login"
                    : "/auth/login";

            const response = await api.post(
                endpoint,
                {
                    username,
                    password,
                }
            );

            const data = response.data;

            const userData =
                role === "STUDENT"
                    ? {
                        studentId: data.adminId,
                        username: data.username,
                        token: data.token,
                        role: "STUDENT",
                    }
                    : {
                        adminId: data.adminId,
                        username: data.username,
                        token: data.token,
                        role: "ADMIN",
                    };

            localStorage.setItem(
                "campusconnect_token",
                data.token
            );

            localStorage.setItem(
                "campusconnect_user",
                JSON.stringify(userData)
            );

            setUser(userData);

            return {
                success: true,
                user: userData,
            };

        } catch (error) {

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Login failed. Please check your credentials.",
            };

        } finally {
            setLoading(false);
        }
    };

    const registerStudent = async (studentData) => {

        setLoading(true);

        try {

            const response = await api.post(
                "/auth/student-register",
                studentData
            );

            return {
                success: true,
                message: response.data.message,
            };

        } catch (error) {

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Unable to create student account.",
            };

        } finally {
            setLoading(false);
        }
    };

    const logout = () => {

        localStorage.removeItem(
            "campusconnect_token"
        );

        localStorage.removeItem(
            "campusconnect_user"
        );

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                registerStudent,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
