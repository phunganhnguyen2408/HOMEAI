import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingBag,
    Mail,
    Settings,
    LogOut,
    Armchair,
    ExternalLink
} from "lucide-react";
import { API_URL, isAdmin } from "../config/api";
import "../styles/admin.css";

function Admin() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [summaryError, setSummaryError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("homeai_token");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        fetch(`${API_URL}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error("Phiên đăng nhập không hợp lệ.");
                }

                if (!isAdmin(data.data?.role)) {
                    navigate("/", { replace: true });
                    return;
                }

                setUser(data.data);
            })
            .catch(() => {
                localStorage.removeItem("homeai_token");
                localStorage.removeItem("homeai_user");
                navigate("/login", { replace: true });
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    useEffect(() => {
        if (!user) return undefined;

        const controller = new AbortController();
        async function loadSummary() {
            try {
                const response = await fetch(`${API_URL}/api/admin/summary`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("homeai_token")}`
                    },
                    signal: controller.signal
                });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Không thể tải số liệu quản trị.");
                }
                setSummary(result.data);
                setSummaryError("");
            } catch (error) {
                if (error.name === "AbortError") return;
                console.error("Lỗi tải số liệu tổng quan:", error);
                setSummaryError(error.message || "Không thể kết nối máy chủ.");
            }
        }

        loadSummary();
        return () => controller.abort();
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem("homeai_token");
        localStorage.removeItem("homeai_user");
        navigate("/login", { replace: true });
    };

    if (loading) {
        return <div className="admin-loading">Đang kiểm tra quyền truy cập...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <Link to="/" className="admin-logo">
                    <Armchair size={27} />
                    <span>HOME<span className="admin-logo-accent">AI</span></span>
                </Link>

                <p className="admin-menu-title">QUẢN LÝ WEBSITE</p>

                <nav className="admin-nav">
                    <Link to="/admin" className="admin-nav-item active">
                        <LayoutDashboard size={19} />
                        Tổng quan
                    </Link>

                    <Link to="/admin/products" className="admin-nav-item">
                        <Package size={19} />
                        Sản phẩm
                    </Link>

                    <Link to="/admin/customers" className="admin-nav-item">
                        <Users size={19} />
                        Khách hàng
                    </Link>

                    <Link to="/admin/orders" className="admin-nav-item">
                        <ShoppingBag size={19} />
                        Đơn hàng
                    </Link>

                    <Link to="/admin/contacts" className="admin-nav-item">
                        <Mail size={19} />
                        Tin nhắn liên hệ
                    </Link>

                    <Link to="/admin/settings" className="admin-nav-item">
                        <Settings size={19} />
                        Cài đặt
                    </Link>
                </nav>

                <button className="admin-logout" onClick={handleLogout}>
                    <LogOut size={19} />
                    Đăng xuất
                </button>
                <Link to="/" className="admin-view-site">
                    <ExternalLink size={18} />
                    Xem website
                </Link>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        <p className="admin-breadcrumb">HOMEAI / QUẢN TRỊ</p>
                        <h1>Tổng quan</h1>
                    </div>

                    <div className="admin-profile">
                        <div className="admin-avatar">
                            {(user.full_name || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong>{user.full_name}</strong>
                            <span>Quản trị viên</span>
                        </div>
                    </div>
                </header>

                <section className="admin-welcome">
                    <div>
                        <p>ADMIN DASHBOARD</p>
                        <h2>Chào mừng trở lại, {user.full_name}!</h2>
                        <span>Quản lý hoạt động website HOMEAI tại đây.</span>
                    </div>
                    <Armchair size={65} strokeWidth={1.3} />
                </section>

                {summaryError && (
                    <p className="admin-list-error" role="alert">{summaryError}</p>
                )}

                <section className="admin-stat-grid">
                    {[
                        ["Tổng sản phẩm", summary?.products, Package],
                        ["Khách hàng", summary?.customers, Users],
                        ["Đơn hàng", summary?.orders, ShoppingBag],
                        ["Tin nhắn mới", summary?.messages, Mail]
                    ].map(([label, value, Icon]) => (
                        <article className="admin-stat-card" key={label}>
                            <div className="admin-stat-icon">
                                <Icon size={23} />
                            </div>
                            <p>{label}</p>
                            <h3>{value == null ? "—" : Number(value).toLocaleString("vi-VN")}</h3>
                            <span>{value == null ? "Chưa có dữ liệu" : "Số liệu hiện tại"}</span>
                        </article>
                    ))}
                </section>

                <section className="admin-content-card">
                    <h2>Quản lý nhanh</h2>
                    <p>
                        Chọn chức năng trong menu bên trái để quản lý website.
                        Các trang quản lý sẽ được kết nối lần lượt với MySQL.
                    </p>
                    <div className="admin-quick-links">
                        <Link to="/admin/products">
                            <Package size={20} />
                            Quản lý sản phẩm
                        </Link>
                        <Link to="/admin/customers">
                            <Users size={20} />
                            Quản lý khách hàng
                        </Link>
                        <Link to="/admin/orders">
                            <ShoppingBag size={20} />
                            Quản lý đơn hàng
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Admin;
