import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../css/AuthStyles.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Register
    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setIsError(false);

        // Check password
        if (
            formData.password !==
            formData.password_confirmation
        ) {
            setIsError(true);
            setMessage("Passwords do not match.");
            return;
        }

        // Password length
        if (formData.password.length < 6) {
            setIsError(true);
            setMessage(
                "Password must be at least 6 characters."
            );
            return;
        }

        // Phone validation
        if (!/^[0-9]{10}$/.test(formData.phone)) {
            setIsError(true);
            setMessage(
                "Phone number must contain exactly 10 digits."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/register",
                formData
            );

            console.log(
                "Register Response:",
                response.data
            );

            // Save token
            if (response.data.token) {
                localStorage.setItem(
                    "token",
                    response.data.token
                );
            }

            // Save user
            if (response.data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );
            }

            setIsError(false);

            setMessage(
                response.data.message ||
                "Registration successful!"
            );

            // Go to login
            setTimeout(() => {
                navigate("/");
            }, 1200);

        } catch (error) {
            console.error(
                "Registration Error:",
                error
            );

            setIsError(true);

            if (error.response) {

                console.log(
                    "Laravel response:",
                    error.response.data
                );

                // Laravel validation errors
                if (error.response.data.errors) {

                    const errors =
                        error.response.data.errors;

                    const firstError =
                        Object.values(errors)[0]?.[0];

                    setMessage(
                        firstError ||
                        "Validation failed."
                    );

                } else {

                    setMessage(
                        error.response.data.message ||
                        "Registration failed."
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

            <div className="auth-card register-card">

                {/* Logo */}
                <div className="auth-logo">
                    S
                </div>

                {/* Title */}
                <h2 className="auth-title">
                    Create an account
                </h2>

                <p className="auth-subtitle">
                    Create your account and get started
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

                {/* Registration Form */}
                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    {/* Name */}
                    <div className="form-group">

                        <label htmlFor="name">
                            Full name
                        </label>

                        <div className="input-wrapper">

                            <span className="input-icon">
                                👤
                            </span>

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="form-input"
                                autoComplete="name"
                                required
                            />

                        </div>

                    </div>

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

                    {/* Phone */}
                    <div className="form-group">

                        <label htmlFor="phone">
                            Phone number
                        </label>

                        <div className="input-wrapper">

                            <span className="input-icon">
                                📞
                            </span>

                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="9876543210"
                                className="form-input"
                                autoComplete="tel"
                                maxLength="10"
                                inputMode="numeric"
                                required
                            />

                        </div>

                        <span className="password-info">
                            Enter a 10-digit phone number.
                        </span>

                    </div>

                    {/* Password */}
                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

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
                                placeholder="Create a password"
                                className="form-input password-input"
                                autoComplete="new-password"
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

                        <span className="password-info">
                            Use at least 6 characters.
                        </span>

                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">

                        <label htmlFor="password_confirmation">
                            Confirm password
                        </label>

                        <div className="input-wrapper">

                            <span className="input-icon">
                                🔐
                            </span>

                            <input
                                id="password_confirmation"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password_confirmation"
                                value={
                                    formData.password_confirmation
                                }
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                className="form-input password-input"
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >
                                {showConfirmPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>

                        </div>

                    </div>

                    {/* Terms */}
                    <div className="terms-row">

                        <label className="checkbox-label">

                            <input
                                type="checkbox"
                                required
                            />

                            <span>
                                I agree to the{" "}

                                <Link
                                    to="/terms"
                                    className="terms-link"
                                >
                                    Terms & Conditions
                                </Link>
                            </span>

                        </label>

                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating account...
                            </>
                        ) : (
                            <>
                                Create account

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

                {/* Login */}
                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <Link
                        to="/"
                        className="auth-link"
                    >
                        Sign in
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Register;