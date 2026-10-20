import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { API_URL, isAdmin } from "../config/api";
import "../styles/auth.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const successMessage = location.state?.message;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Đăng nhập thất bại.");
            }

            localStorage.setItem("homeai_token", data.token);
            localStorage.setItem("homeai_user", JSON.stringify(data.data));

            if (isAdmin(data.data?.role)) {
                navigate("/admin", { replace: true });
            } else {
                navigate(location.state?.from || "/", { replace: true });
            }
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
                <h1>Chào mừng trở lại</h1>
                <p className="auth-subtitle">
                    Đăng nhập để tiếp tục hành trình kiến tạo tổ ấm.
                </p>

                {successMessage && (
                    <p className="auth-success" role="status">
                        {successMessage}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="login-email">Email</label>
                    <div className="auth-input">
                        <Mail size={18} />
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Nhập email của bạn"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <label htmlFor="login-password">Mật khẩu</label>
                    <div className="auth-input">
                        <Lock size={18} />
                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Nhập mật khẩu"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <p className="auth-error" role="alert">{error}</p>
                    )}

                    <button className="auth-submit" disabled={loading}>
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="auth-switch">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </p>

                <Link to="/" className="auth-back">← Quay lại trang chủ</Link>
            </section>
        </main>
    );
}

export default Login;
