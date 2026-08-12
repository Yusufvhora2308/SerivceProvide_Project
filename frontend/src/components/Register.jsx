import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setIsError(false);

        // Password check
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

            // If Laravel sends token
            if (response.data.token) {
                localStorage.setItem(
                    "token",
                    response.data.token
                );
            }

            // If Laravel sends user
            if (response.data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        response.data.user
                    )
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
            }, 1000);

        } catch (error) {
            console.error(
                "Registration Error:",
                error
            );

            setIsError(true);

            if (error.response) {

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

            <div className="auth-card">

                <h2>Create Account</h2>

                <p className="auth-subtitle">
                    Register a new account
                </p>

                {message && (
                    <div
                        className={
                            isError
                                ? "message error"
                                : "message success"
                        }
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Name */}
                    <div className="form-group">
                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label>Phone</label>

                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="9876543210"
                            maxLength="10"
                            inputMode="numeric"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label>
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="password_confirmation"
                            value={
                                formData.password_confirmation
                            }
                            onChange={handleChange}
                            placeholder="Confirm password"
                            required
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Registering..."
                            : "Register"}
                    </button>

                </form>

                <p className="auth-footer">
                    Already have an account?{" "}

                    <Link to="/">
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Register;