import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/product-detail.css";
import { getProductImageUrl } from "../productImages";

const colors = [{ label: "Kem", className: "color-1" }, { label: "Xám", className: "color-2" }, { label: "Nâu", className: "color-3" }];

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [color, setColor] = useState("Kem");
    const [size, setSize] = useState("3 chỗ");
    const [activeTab, setActiveTab] = useState("description");
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const endpoint = id.startsWith("room-")
            ? `http://localhost:5001/api/room-products/id/${id.replace("room-", "")}`
            : `http://localhost:5001/api/products/${id}`;

        fetch(endpoint)
            .then((response) => response.json())
            .then((data) => setProduct(data.data))
            .catch(() => setProduct(null));
    }, [id]);

    if (!product) return <p className="loading-product">Đang tải sản phẩm...</p>;

    const imageUrl = getProductImageUrl(product.image);
    const images = [imageUrl, imageUrl, imageUrl];
    const addToCart = (goToCart = false) => {
        addItem(product, quantity, { color, size });
        if (goToCart) navigate("/cart");
    };

    return <div className="product-detail-page">
        <div className="product-breadcrumb">Trang chủ › Sản phẩm › {product.product_name}</div>
        <div className="product-detail">
            <div className="product-detail-gallery"><div className="product-thumbnails">{images.map((image, index) => <button type="button" key={index} className={`thumbnail ${activeImage === index ? "active" : ""}`} onClick={() => setActiveImage(index)} aria-label={`Xem ảnh ${index + 1}`}><img src={image} alt={product.product_name} /></button>)}</div><div className="product-main-image"><img src={images[activeImage]} alt={product.product_name} /></div></div>
            <div className="product-detail-info"><h1>{product.product_name}</h1><div className="product-rating"><span>★★★★★</span><span className="rating-text">4.8 (120 đánh giá)</span></div><div className="product-price-box"><span className="detail-price">{Number(product.price).toLocaleString("vi-VN")} VNĐ</span><span className="old-price">16.990.000 VNĐ</span><span className="discount">-21%</span></div><p className="product-short-description">{product.description}</p>
                <div className="product-option"><strong>Màu sắc</strong><div className="color-options">{colors.map((item) => <button key={item.label} type="button" className={`color-circle ${item.className} ${color === item.label ? "selected" : ""}`} onClick={() => setColor(item.label)} aria-label={`Chọn màu ${item.label}`} aria-pressed={color === item.label} />)}</div></div>
                <div className="product-option"><strong>Kích thước</strong><div className="size-options">{["2 chỗ", "3 chỗ", "4 chỗ"].map((option) => <button type="button" key={option} className={size === option ? "selected" : ""} onClick={() => setSize(option)}>{option}</button>)}</div></div>
                <div className="product-option"><strong>Số lượng</strong><div className="quantity-box"><button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Giảm số lượng">−</button><span>{quantity}</span><button type="button" onClick={() => setQuantity((current) => current + 1)} aria-label="Tăng số lượng">+</button></div></div>
                <button className="add-cart-btn" type="button" onClick={() => addToCart()}>Thêm vào giỏ hàng</button><button className="buy-now-btn" type="button" onClick={() => addToCart(true)}>Mua ngay</button>
                <div className="product-services"><div>🚚<span><strong>Miễn phí vận chuyển</strong><small>Đơn từ 2.000.000đ</small></span></div><div>🛡️<span><strong>Bảo hành 12 tháng</strong><small>Chính hãng 100%</small></span></div><div>↩️<span><strong>Đổi trả 7 ngày</strong><small>Nếu sản phẩm lỗi</small></span></div></div>
            </div>
        </div>
        <div className="product-detail-bottom"><div className="detail-tabs"><button type="button" className={activeTab === "description" ? "active" : ""} onClick={() => setActiveTab("description")}>Mô tả sản phẩm</button><button type="button" className={activeTab === "specs" ? "active" : ""} onClick={() => setActiveTab("specs")}>Thông số kỹ thuật</button><button type="button" className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")}>Đánh giá (120)</button></div><div className="detail-content">{activeTab === "description" && <><h3>Thông tin sản phẩm</h3><p>{product.description}</p></>}{activeTab === "specs" && <><h3>Thông số kỹ thuật</h3><ul><li><strong>Chất liệu:</strong> {product.material}</li><li><strong>Kích thước:</strong> {product.dimensions}</li><li><strong>Màu sắc:</strong> {product.color}</li><li><strong>Số lượng còn:</strong> {product.stock_quantity}</li></ul></>}{activeTab === "reviews" && <><h3>Đánh giá từ khách hàng</h3><p>Sản phẩm được đánh giá 4.8/5 từ 120 khách hàng.</p></>}</div><div className="homeai-suggestion"><div className="homeai-icon">🤖</div><div><h3>HomeAI gợi ý cho bạn</h3><p>Nhận tư vấn phù hợp với không gian sống của bạn.</p></div><button type="button" onClick={() => navigate("/ai-design")}>Xem gợi ý →</button></div></div>
    </div>;
}
export default ProductDetail;
