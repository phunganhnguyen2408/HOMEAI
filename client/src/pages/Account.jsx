import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ExternalLink,
    LogOut,
    PackageCheck,
    ShoppingBag,
    UserRound,
    Wallet
} from "lucide-react";
import { API_URL, isAdmin } from "../config/api";
import "../styles/account.css";

const statusLabels = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang chuẩn bị",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy"
};

function money(value) {
    const amount = Number(value);
    return `${(Number.isFinite(amount) ? amount : 0).toLocaleString("vi-VN")} ₫`;
}

function Account() {
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const token = localStorage.getItem("homeai_token");

        if (!token) {
            navigate("/login", {
                replace: true,
                state: { message: "Vui lòng đăng nhập để xem tài khoản." }
            });
            return () => controller.abort();
        }

        async function loadAccount() {
            try {
                const response = await fetch(`${API_URL}/api/account`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Không thể tải tài khoản.");
                }

                setData(result.data);
                setError("");
            } catch (loadError) {
                if (loadError.name === "AbortError") return;
                console.error("Lỗi tải tài khoản:", loadError);
                setError(loadError.message || "Không thể kết nối máy chủ.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        loadAccount();
        return () => controller.abort();
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("homeai_token");
        localStorage.removeItem("homeai_user");
        navigate("/login", {
            replace: true,
            state: { message: "Bạn đã đăng xuất khỏi HOMEAI." }
        });
    };

    if (loading) {
        return (
            <main className="account-page">
                <div className="account-state">Đang tải thông tin tài khoản...</div>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="account-page">
                <section className="account-state account-state-error">
                    <h1>Chưa thể tải tài khoản</h1>
                    <p>{error || "Vui lòng đăng nhập lại để tiếp tục."}</p>
                    <Link className="account-primary-link" to="/login">
                        Đăng nhập lại <ArrowRight size={17} />
                    </Link>
                </section>
            </main>
        );
    }

    const { user, summary = {}, orders = [] } = data;
    const fullName = user.full_name || "Khách hàng HOMEAI";

    return (
        <main className="account-page">
            <div className="account-shell">
                {location.state?.notice && (
                    <p className="account-notice" role="status">
                        {location.state.notice}
                    </p>
                )}

                <section className="account-hero">
                    <div className="account-avatar">
                        {(fullName[0] || "H").toLocaleUpperCase("vi-VN")}
                    </div>
                    <div className="account-identity">
                        <span className="account-eyebrow">TÀI KHOẢN HOMEAI</span>
                        <h1>Xin chào, {fullName}</h1>
                        <p>{user.email}</p>
                    </div>
                    <div className="account-actions">
                        {isAdmin(user.role) && (
                            <Link className="account-admin" to="/admin">
                                <ExternalLink size={17} /> Vào quản trị
                            </Link>
                        )}
                        <button className="account-logout" onClick={logout}>
                            <LogOut size={17} /> Đăng xuất
                        </button>
                    </div>
                </section>

                <section className="account-stats" aria-label="Tổng quan tài khoản">
                    <article>
                        <span className="account-stat-icon"><ShoppingBag size={20} /></span>
                        <div>
                            <b>{Number(summary.total_orders || 0).toLocaleString("vi-VN")}</b>
                            <span>Đơn hàng</span>
                        </div>
                    </article>
                    <article>
                        <span className="account-stat-icon"><Wallet size={20} /></span>
                        <div>
                            <b>{money(summary.total_spent)}</b>
                            <span>Tổng giá trị đơn hàng</span>
                        </div>
                    </article>
                    <article>
                        <span className="account-stat-icon"><PackageCheck size={20} /></span>
                        <div>
                            <b>HOMEAI</b>
                            <span>Thành viên thân thiết</span>
                        </div>
                    </article>
                </section>

                <section className="account-orders">
                    <header className="account-section-heading">
                        <div>
                            <span className="account-eyebrow">MUA SẮM CỦA BẠN</span>
                            <h2>Đơn hàng gần đây</h2>
                        </div>
                        <Link to="/products">
                            Tiếp tục mua sắm <ArrowRight size={16} />
                        </Link>
                    </header>

                    {orders.length > 0 ? (
                        <div className="account-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mã đơn hàng</th>
                                        <th>Ngày đặt</th>
                                        <th>Thanh toán</th>
                                        <th>Trạng thái</th>
                                        <th className="account-amount-heading">Tổng tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.order_id}>
                                            <td className="account-order-code">{order.order_code}</td>
                                            <td>
                                                {new Date(order.created_at).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td>
                                                {order.payment_method === "COD"
                                                    ? "Khi nhận hàng"
                                                    : order.payment_method || "—"}
                                            </td>
                                            <td>
                                                <span className={`account-order-status status-${String(order.order_status || "").toLowerCase()}`}>
                                                    {statusLabels[order.order_status] || order.order_status || "—"}
                                                </span>
                                            </td>
                                            <td className="account-amount">{money(order.final_amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="account-empty-orders">
                            <span><PackageCheck size={25} /></span>
                            <h3>Bạn chưa có đơn hàng nào</h3>
                            <p>Khám phá bộ sưu tập nội thất và bắt đầu làm mới không gian sống.</p>
                            <Link className="account-primary-link" to="/products">
                                Khám phá sản phẩm <ArrowRight size={17} />
                            </Link>
                        </div>
                    )}
                </section>

                <footer className="account-footer">
                    <UserRound size={16} />
                    <span>Thông tin tài khoản của bạn được bảo mật bởi HOMEAI.</span>
                </footer>
            </div>
        </main>
    );
}

export default Account;
