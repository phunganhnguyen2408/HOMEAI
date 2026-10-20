import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { API_URL } from "../config/api";
import "../styles/admin.css";

const configs = {
    "/admin/products": {
        title: "Sản phẩm",
        key: "products",
        fields: ["product_type", "product_name", "product_code", "room", "price", "stock_quantity", "status"]
    },
    "/admin/customers": {
        title: "Khách hàng",
        key: "customers",
        fields: ["full_name", "email", "status", "created_at"]
    },
    "/admin/orders": {
        title: "Đơn hàng",
        key: "orders",
        fields: ["order_code", "full_name", "final_amount", "order_status", "created_at"]
    },
    "/admin/contacts": {
        title: "Tin nhắn liên hệ",
        key: "messages",
        fields: ["full_name", "email", "subject", "status", "created_at"]
    }
};

const labels = {
    product_type: "Danh mục",
    product_name: "Tên sản phẩm",
    product_code: "Mã sản phẩm",
    price: "Giá",
    stock_quantity: "Tồn kho",
    status: "Trạng thái",
    full_name: "Khách hàng",
    email: "Email",
    created_at: "Ngày tạo",
    order_code: "Mã đơn",
    final_amount: "Tổng tiền",
    order_status: "Trạng thái đơn",
    subject: "Chủ đề",
    room: "Không gian"
};

const roomLabels = {
    living_room: "Phòng khách",
    bedroom: "Phòng ngủ",
    kitchen: "Phòng bếp",
    office: "Phòng làm việc"
};

const statusLabels = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang chuẩn bị",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Đã ẩn",
    OUT_OF_STOCK: "Hết hàng",
    NEW: "Mới",
    REPLIED: "Đã phản hồi"
};

function formatValue(field, value) {
    if (value == null || value === "") return "—";
    if (field === "price" || field === "final_amount") {
        return `${Number(value).toLocaleString("vi-VN")} ₫`;
    }
    if (field === "created_at") {
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? String(value)
            : date.toLocaleDateString("vi-VN");
    }
    if (field === "status" || field === "order_status") {
        return statusLabels[String(value).toUpperCase()] || String(value);
    }
    if (field === "room") {
        return roomLabels[String(value)] || String(value);
    }
    return String(value);
}

export default function AdminList() {
    const { pathname } = useLocation();
    const page = configs[pathname] || configs["/admin/products"];
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        async function loadItems() {
            try {
                const response = await fetch(`${API_URL}/api/admin/${page.key}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("homeai_token")}`
                    },
                    signal: controller.signal
                });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Không thể tải dữ liệu.");
                }
                setItems(result.data);
                setError("");
            } catch (loadError) {
                if (loadError.name === "AbortError") return;
                console.error("Lỗi tải danh sách quản trị:", loadError);
                setError(loadError.message || "Không thể kết nối máy chủ.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        loadItems();
        return () => controller.abort();
    }, [page.key]);

    const approveOrder = async (order) => {
        setUpdatingId(order.order_id);
        setError("");
        try {
            const response = await fetch(
                `${API_URL}/api/admin/orders/${order.order_id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("homeai_token")}`
                    },
                    body: JSON.stringify({ order_status: "CONFIRMED" })
                }
            );
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Không thể xác nhận đơn hàng.");
            }
            setItems((current) => current.map((item) =>
                item.order_id === order.order_id
                    ? { ...item, order_status: "CONFIRMED" }
                    : item
            ));
        } catch (updateError) {
            console.error("Lỗi xác nhận đơn hàng:", updateError);
            setError(updateError.message || "Không thể kết nối máy chủ.");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <main className="admin-main admin-list">
            <Link to="/admin">← Tổng quan</Link>
            <h1>{page.title}</h1>
            {error && <p className="admin-list-error" role="alert">{error}</p>}
            <div className="admin-content-card admin-table-card">
                <div className="admin-table-wrap">
                    <table>
                        <thead>
                            <tr>
                                {page.fields.map((field) => (
                                    <th key={field}>{labels[field] || field}</th>
                                ))}
                                {page.key === "orders" && <th>Thao tác</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr
                                    key={
                                        `${item.product_type || ""}-${item.order_id || item.product_id || item.user_id || item.id || index}`
                                    }
                                >
                                    {page.fields.map((field) => (
                                        <td key={field}>
                                            {formatValue(field, item[field])}
                                        </td>
                                    ))}
                                    {page.key === "orders" && (
                                        <td>
                                            {item.order_status === "PENDING" ? (
                                                <button
                                                    className="admin-approve-order"
                                                    type="button"
                                                    disabled={updatingId === item.order_id}
                                                    onClick={() => approveOrder(item)}
                                                >
                                                    {updatingId === item.order_id
                                                        ? "Đang duyệt..."
                                                        : "Xác nhận đơn"}
                                                </button>
                                            ) : (
                                                <span className="admin-order-processed">
                                                    Đã xử lý
                                                </span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {loading && <p className="admin-list-message">Đang tải dữ liệu...</p>}
                {!loading && !error && items.length === 0 && (
                    <p className="admin-list-message">Chưa có dữ liệu.</p>
                )}
            </div>
        </main>
    );
}
