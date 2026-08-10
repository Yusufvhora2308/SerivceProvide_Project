import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../css/AuthStyles.css";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ============================
    // HANDLE INPUT CHANGE
    // ============================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // ============================
    // LOGIN
    // ============================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setIsError(false);

        try {
            const response = await api.post(
                "/login",
                formData
            );

            console.log(
                "Login Response:",
                response.data
            );

            // Laravel response:
            //
            // {
            //     success: true,
            //     message: "Login successful",
            //     data: {
            //         user: {...},
            //         token: "...",
            //         token_type: "Bearer"
            //     }
            // }

            const loginData = response.data.data;

            if (!loginData) {
                setIsError(true);
                setMessage(
                    "Invalid response from server."
                );
                return;
            }

            const token = loginData.token;
            const user = loginData.user;

            // Check token and user
            if (!token || !user) {
                setIsError(true);
                setMessage(
                    "Invalid response from server."
                );
                return;
            }

            // ============================
            // SAVE TOKEN
            // ============================

            localStorage.setItem(
                "token",
                token
            );

            // ============================
            // SAVE USER
            // ============================

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            console.log("Token:", token);
            console.log("User:", user);

            // ============================
            // LOGIN SUCCESS
            // ============================

            setIsError(false);

            setMessage(
                response.data.message ||
                "Login successful!"
            );

            // ============================
            // REDIRECT
            // ============================

            setTimeout(() => {
                navigate("/dashboard");
            }, 800);

        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            setIsError(true);

            // Laravel response error
            if (error.response) {

                console.log(
                    "Laravel Error:",
                    error.response.data
                );

                // Validation errors
                if (
                    error.response.data.errors
                ) {

                    const errors =
                        error.response.data.errors;

                    const firstError =
                        Object.values(
                            errors
                        )[0]?.[0];

                    setMessage(
                        firstError ||
                        "Validation error."
                    );

                } else {

                    setMessage(
                        error.response.data.message ||
                        "Login failed."
                    );
                }

            } else if (error.request) {

                setMessage(
                    "Unable to connect to Laravel server."
                );

            } else {

                setMessage(
                    "Something went wrong."
                );
            }

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                {/* Logo */}
                <div className="auth-logo">
                    S
                </div>

                {/* Title */}
                <h2 className="auth-title">
                    Welcome back
                </h2>

                <p className="auth-subtitle">
                    Sign in to continue to your account
                </p>

                {/* Message */}
                {message && (
                    <div
                        className={`auth-message ${
                            isError
                                ? "error"
                                : "success"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {/* Login Form */}
                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    {/* Email */}
                    <div className="form-group">

                        <label htmlFor="email">
                            Email address
                        </label>

                        <div className="input-wrapper">

                            <span className="input-icon">
                                ✉
                            </span>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="form-input"
                                autoComplete="email"
                                required
                            />

                        </div>

                    </div>

                    {/* Password */}
                    <div className="form-group">

                        <div className="label-row">

                            <label htmlFor="password">
                                Password
                            </label>

                            <Link
                                to="/forgot-password"
                                className="forgot-link"
                            >
                                Forgot password?
                            </Link>

                        </div>

                        <div className="input-wrapper">

                            <span className="input-icon">
                                🔒
                            </span>

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="form-input password-input"
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>

                        </div>

                    </div>

                    {/* Remember Me */}
                    <div className="remember-row">

                        <label className="checkbox-label">

                            <input
                                type="checkbox"
                            />

                            <span>
                                Remember me
                            </span>

                        </label>

                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Logging in...
                            </>
                        ) : (
                            <>
                                Login

                                <span className="button-arrow">
                                    →
                                </span>
                            </>
                        )}

                    </button>

                </form>

                {/* Divider */}
                <div className="auth-divider">
                    <span>OR</span>
                </div>

                {/* Register */}
                <div className="auth-footer">

                    <span>
                        Don't have an account?
                    </span>

                    <Link
                        to="/register"
                        className="auth-link"
                    >
                        Create account
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Login;