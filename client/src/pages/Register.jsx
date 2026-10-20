
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Mail, Lock, ArrowRight } from "lucide-react";
import "../styles/auth.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5001/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        full_name: formData.full_name,
                        email: formData.email,
                        password: formData.password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Đăng ký thất bại.");
            }

            navigate("/login", {
                state: { message: "Đăng ký thành công! Hãy đăng nhập." }
            });
        } catch (error) {
            setError(error.message || "Không thể kết nối máy chủ.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <Link to="/" className="auth-brand">
                    HOME<span>AI</span>
                </Link>

                <p className="auth-eyebrow">HOMEAI SMART INTERIOR</p>
                <h1>Tạo tài khoản</h1>
                <p className="auth-subtitle">
                    Tham gia HOMEAI để khám phá không gian sống lý tưởng.
                </p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="full_name">Họ và tên</label>
                    <div className="auth-input">
                        <UserRound size={18} />
                        <input
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên"
                            maxLength={100}
                            autoComplete="name"
                            required
                        />
                    </div>

                    <label htmlFor="register-email">Email</label>
                    <div className="auth-input">
                        <Mail size={18} />
                        <input
                            id="register-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@gmail.com"
                            maxLength={150}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <label htmlFor="register-password">Mật khẩu</label>
                    <div className="auth-input">
                        <Lock size={18} />
                        <input
                            id="register-password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Ít nhất 8 ký tự"
                            minLength={8}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                    <div className="auth-input">
                        <Lock size={18} />
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu"
                            minLength={8}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    {error && (
                        <p className="auth-error" role="alert">{error}</p>
                    )}

                    <button className="auth-submit" disabled={loading}>
                        {loading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="auth-switch">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>

                <Link to="/" className="auth-back">← Quay lại trang chủ</Link>
            </section>
        </main>
    );
}

export default Register;
