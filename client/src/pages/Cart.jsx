import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, PackageCheck, Phone, UserRound } from "lucide-react";
import { API_URL } from "../config/api";
import { useCart } from "../context/CartContext";
import "../styles/cart.css";

const money = (value) => `${Number(value).toLocaleString("vi-VN")} ₫`;

function getSavedName() {
    try {
        return JSON.parse(localStorage.getItem("homeai_user") || "null")?.full_name || "";
    } catch {
        return "";
    }
}

function Cart() {
    const navigate = useNavigate();
    const { items, updateQuantity, removeItem } = useCart();
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [receiverName, setReceiverName] = useState(getSavedName);
    const [receiverPhone, setReceiverPhone] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const total = items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const beginCheckout = () => {
        if (!localStorage.getItem("homeai_token")) {
            navigate("/login", {
                state: {
                    from: "/cart",
                    message: "Đăng nhập để hoàn tất đơn hàng."
                }
            });
            return;
        }

        setError("");
        setCheckoutOpen(true);
    };

    const submitOrder = async (event) => {
        event.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError("");

        try {
            const token = localStorage.getItem("homeai_token");
            if (!token) {
                navigate("/login", {
                    state: {
                        from: "/cart",
                        message: "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại."
                    }
                });
                return;
            }

            const response = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver_name: receiverName,
                    receiver_phone: receiverPhone,
                    address,
                    note,
                    items: items.map((item) => ({
                        product_id: item.productId,
                        quantity: item.quantity
                    }))
                })
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Không thể tạo đơn hàng.");
            }

            items.forEach((item) => removeItem(item.key));
            navigate("/account", {
                replace: true,
                state: {
                    notice: `Đặt hàng thành công! Mã đơn ${result.data.order_code}. Bạn thanh toán khi nhận hàng.`
                }
            });
        } catch (orderError) {
            console.error("Lỗi đặt hàng:", orderError);
            setError(orderError.message || "Không thể kết nối máy chủ.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!items.length) {
        return (
            <main className="cart-page cart-empty">
                <div className="cart-empty-icon"><PackageCheck size={31} /></div>
                <h1>Giỏ hàng của bạn đang trống</h1>
                <p>Chọn món nội thất bạn yêu thích để bắt đầu hoàn thiện không gian sống.</p>
                <Link to="/products" className="cart-primary">Khám phá sản phẩm</Link>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <Link className="cart-back-link" to="/products">
                <ArrowLeft size={16} /> Tiếp tục mua sắm
            </Link>
            <div className="cart-heading">
                <div>
                    <span className="cart-eyebrow">HOMEAI SMART INTERIOR</span>
                    <h1>Giỏ hàng</h1>
                </div>
                <span className="cart-item-count">{items.length} sản phẩm</span>
            </div>

            <div className="cart-layout">
                <section className="cart-items" aria-label="Sản phẩm trong giỏ hàng">
                    {items.map((item) => (
                        <article className="cart-item" key={item.key}>
                            <div className="cart-item-image">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} />
                                ) : (
                                    <PackageCheck size={28} />
                                )}
                            </div>
                            <div className="cart-item-info">
                                <h2>{item.name}</h2>
                                {(item.color || item.size) && (
                                    <p>
                                        {item.color && `Màu ${item.color}`}
                                        {item.color && item.size && " · "}
                                        {item.size && item.size}
                                    </p>
                                )}
                                <strong>{money(item.price)}</strong>
                            </div>
                            <div className="cart-quantity" aria-label="Số lượng">
                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                    aria-label="Giảm số lượng"
                                >
                                    −
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                    aria-label="Tăng số lượng"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                className="cart-remove"
                                type="button"
                                onClick={() => removeItem(item.key)}
                            >
                                Xóa
                            </button>
                        </article>
                    ))}
                </section>

                <aside className="cart-summary">
                    <span className="cart-eyebrow">ĐƠN HÀNG CỦA BẠN</span>
                    <h2>Tóm tắt đơn hàng</h2>
                    <p><span>Tạm tính</span><strong>{money(total)}</strong></p>
                    <p><span>Vận chuyển</span><strong className="cart-free">Miễn phí</strong></p>
                    <div className="cart-total"><span>Tổng cộng</span><strong>{money(total)}</strong></div>
                    <p className="cart-cod-note">
                        <CheckCircle2 size={16} />
                        Thanh toán khi nhận hàng (COD)
                    </p>
                    {!checkoutOpen ? (
                        <button
                            type="button"
                            className="cart-primary"
                            onClick={beginCheckout}
                        >
                            Tiến hành đặt hàng
                        </button>
                    ) : (
                        <form className="cart-checkout-form" onSubmit={submitOrder}>
                            <h3>Thông tin nhận hàng</h3>
                            <label>
                                <span>Họ tên người nhận</span>
                                <div className="cart-form-field">
                                    <UserRound size={17} />
                                    <input
                                        autoComplete="name"
                                        required
                                        maxLength={150}
                                        value={receiverName}
                                        onChange={(event) => setReceiverName(event.target.value)}
                                    />
                                </div>
                            </label>
                            <label>
                                <span>Số điện thoại</span>
                                <div className="cart-form-field">
                                    <Phone size={17} />
                                    <input
                                        type="tel"
                                        autoComplete="tel"
                                        required
                                        value={receiverPhone}
                                        onChange={(event) => setReceiverPhone(event.target.value)}
                                        placeholder="09xxxxxxxx"
                                    />
                                </div>
                            </label>
                            <label>
                                <span>Địa chỉ giao hàng</span>
                                <div className="cart-form-field cart-address-field">
                                    <MapPin size={17} />
                                    <textarea
                                        autoComplete="street-address"
                                        required
                                        maxLength={2000}
                                        rows={3}
                                        value={address}
                                        onChange={(event) => setAddress(event.target.value)}
                                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                                    />
                                </div>
                            </label>
                            <label>
                                <span>Ghi chú <small>(không bắt buộc)</small></span>
                                <textarea
                                    maxLength={1000}
                                    rows={2}
                                    value={note}
                                    onChange={(event) => setNote(event.target.value)}
                                    placeholder="Lưu ý khi giao hàng"
                                />
                            </label>
                            {error && <p className="cart-error" role="alert">{error}</p>}
                            <button
                                type="submit"
                                className="cart-primary"
                                disabled={submitting}
                            >
                                {submitting ? "Đang tạo đơn..." : `Đặt hàng · ${money(total)}`}
                            </button>
                            <button
                                className="cart-cancel-checkout"
                                type="button"
                                onClick={() => {
                                    setCheckoutOpen(false);
                                    setError("");
                                }}
                            >
                                Quay lại giỏ hàng
                            </button>
                        </form>
                    )}
                    {!checkoutOpen && (
                        <p className="cart-secure-note">
                            <CheckCircle2 size={15} />
                            Bạn chỉ thanh toán khi nhận hàng
                        </p>
                    )}
                </aside>
            </div>
        </main>
    );
}

export default Cart;
