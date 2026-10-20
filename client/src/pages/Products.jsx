import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/products.css";

const ROOM_OPTIONS = [
    { label: "Tất cả sản phẩm", value: "all" },
    { label: "Phòng khách", value: "living_room" },
    { label: "Phòng ngủ", value: "bedroom" },
    { label: "Phòng bếp", value: "kitchen" },
];

const ROOM_LABELS = {
    living_room: "Phòng khách",
    bedroom: "Phòng ngủ",
    kitchen: "Phòng bếp",
};

const ROOM_IMAGE_URLS = {
    "sofa-white.jpg": "/images/%E1%BA%A3nh%20pkhach/sofa-white.jpg.avif",
    "sofa-corner.jpg": "/images/%E1%BA%A3nh%20pkhach/sofa-corner.jpg.avif",
    "coffee-table.jpg": "/images/%E1%BA%A3nh%20pkhach/coffee-table.jpg.avif",
    "tv-console.jpg": "/images/%E1%BA%A3nh%20pkhach/tv-console.jpg.avif",
    "lounge-chair.jpg": "/images/%E1%BA%A3nh%20pkhach/lounge-chair.jpg.avif",
    "living-room-set.jpg": "/images/%E1%BA%A3nh%20pkhach/living-room-set.jpg.avif",
    "bed-white.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/bed-white.jpg.avif",
    "bed-wood.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/bed-wood.jpg.avif",
    "wardrobe.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/wardrobe.jpg.avif",
    "bedside-table.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/bedside-table.jpg.avif",
    "dressing-table.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/dressing-table.jpg.avif",
    "bedroom-lamp.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/bedroom-lamp.jpg.avif",
    "kitchen-cabinet.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/kitchen-cabinet.jpg.avif",
    "dining-table.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/dining-table.jpg.avif",
    "dining-chair.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/dining-chair.jpg.avif",
    "kitchen-island.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/kitchen-island.jpg.avif",
    "kitchen-shelf.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/kitchen-shelf.jpg.avif",
    "kitchen-cabinet-small.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/kitchen-cabinet-small.jpg.avif",
};

function getImageUrl(image) {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    const filename = image.replace(/^\/images\//, "");

    return ROOM_IMAGE_URLS[filename] || `/images/${filename}`;
}

function formatPrice(price) {
    return `${Number(price || 0).toLocaleString("vi-VN")} VNĐ`;
}

function Products() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem("homeai_favorites");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [keyword, setKeyword] = useState(
        searchParams.get("search") || ""
    );
    const [selectedRoom, setSelectedRoom] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Lưu danh sách yêu thích vào trình duyệt
    useEffect(() => {
        localStorage.setItem(
            "homeai_favorites",
            JSON.stringify(favorites)
        );
    }, [favorites]);

    // Tải sản phẩm cũ và 18 sản phẩm nội thất theo phòng
    useEffect(() => {
        let cancelled = false;

        async function loadProducts() {
            setLoading(true);
            setError("");

            try {
                const [oldResponse, roomResponse] = await Promise.all([
                    fetch("http://localhost:5001/api/products"),
                    fetch("http://localhost:5001/api/room-products"),
                ]);

                if (!oldResponse.ok || !roomResponse.ok) {
                    throw new Error("Backend không trả về dữ liệu hợp lệ.");
                }

                const oldData = await oldResponse.json();
                const roomData = await roomResponse.json();

                if (oldData.success === false || roomData.success === false) {
                    throw new Error("Không thể lấy danh sách sản phẩm.");
                }

                const oldProducts = Array.isArray(oldData.data)
                    ? oldData.data.map((product) => ({
                        ...product,
                        product_id: product.product_id,
                        source: "old",
                    }))
                    : [];

                const roomProducts = Array.isArray(roomData.data)
                    ? roomData.data.map((product) => ({
                        ...product,
                        product_id: `room-${product.id}`,
                        room_product_id: product.id,
                        room_label: product.room,
                        source: "room",
                    }))
                    : [];

                if (!cancelled) {
                    setProducts([...oldProducts, ...roomProducts]);
                }
            } catch (err) {
                console.error("Lỗi tải sản phẩm:", err);

                if (!cancelled) {
                    setError(
                        "Không thể tải sản phẩm. Hãy kiểm tra Backend và MySQL."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadProducts();

        return () => {
            cancelled = true;
        };
    }, []);

    // Thêm hoặc bỏ sản phẩm yêu thích
    function toggleFavorite(productId) {
        setFavorites((current) => {
            if (current.includes(productId)) {
                return current.filter((id) => id !== productId);
            }

            return [...current, productId];
        });
    }

    // Tìm kiếm và lọc theo phòng
    const normalizedKeyword = keyword.trim().toLocaleLowerCase("vi-VN");

    const visibleProducts = products.filter((product) => {
        const matchesKeyword =
            !normalizedKeyword ||
            product.product_name
                ?.toLocaleLowerCase("vi-VN")
                .includes(normalizedKeyword);

        const matchesRoom =
            selectedRoom === "all" ||
            product.room_label === selectedRoom;

        return matchesKeyword && matchesRoom;
    });

    function openProductDetail(product) {
        navigate(`/products/${product.product_id}`);
    }

    return (
        <main className="products-page">
            <header className="products-header">
                <span className="products-eyebrow">
                    HOMEAI SMART INTERIOR
                </span>

                <h1>Sản phẩm nội thất</h1>

                <p>
                    Khám phá nội thất hiện đại và lựa chọn không gian
                    phù hợp với ngôi nhà của bạn.
                </p>
            </header>

            {/* Tìm kiếm sản phẩm */}
            <div className="products-toolbar">
                <label className="products-search">
                    <span aria-hidden="true">⌕</span>

                    <input
                        type="search"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        aria-label="Tìm kiếm sản phẩm"
                    />
                </label>

                <span className="products-result-count">
                    {loading ? "Đang tải..." : `${visibleProducts.length} sản phẩm`}
                </span>
            </div>

            {/* Bộ lọc phòng */}
            <nav className="room-filter-bar" aria-label="Lọc sản phẩm theo phòng">
                {ROOM_OPTIONS.map((room) => (
                    <button
                        key={room.value}
                        type="button"
                        className={
                            selectedRoom === room.value ? "active" : ""
                        }
                        onClick={() => setSelectedRoom(room.value)}
                    >
                        {room.label}
                    </button>
                ))}
            </nav>

            {/* Trạng thái tải và lỗi */}
            {loading && (
                <p className="products-message">
                    Đang tải danh sách sản phẩm...
                </p>
            )}

            {!loading && error && (
                <div className="products-message" role="alert">
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Thử tải lại
                    </button>
                </div>
            )}

            {/* Danh sách sản phẩm */}
            {!loading && !error && (
                <>
                    <div className="products-grid">
                        {visibleProducts.map((product) => (
                            <article
                                className="product-card"
                                key={`${product.source}-${product.product_id}`}
                            >
                                <button
                                    type="button"
                                    className={`favorite-btn ${
                                        favorites.includes(product.product_id)
                                            ? "is-favorite"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        toggleFavorite(product.product_id)
                                    }
                                    aria-label={
                                        favorites.includes(product.product_id)
                                            ? "Bỏ yêu thích"
                                            : "Thêm vào yêu thích"
                                    }
                                    aria-pressed={favorites.includes(
                                        product.product_id
                                    )}
                                >
                                    {favorites.includes(product.product_id)
                                        ? "♥"
                                        : "♡"}
                                </button>

                                <div className="product-image-wrap">
                                    {product.image ? (
                                        <img
                                            src={getImageUrl(product.image)}
                                            alt={product.product_name}
                                            loading="lazy"
                                            onError={(event) => {
                                                console.error(
                                                    "Không tải được ảnh:",
                                                    event.currentTarget.src
                                                );
                                                event.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />
                                    ) : (
                                        <div className="product-image-placeholder">
                                            Chưa có hình ảnh
                                        </div>
                                    )}
                                </div>

                                {product.room_label && (
                                    <span className="product-room-label">
                                        {ROOM_LABELS[product.room_label] ||
                                            product.room_label}
                                    </span>
                                )}

                                <h2>{product.product_name}</h2>

                                <p className="product-price">
                                    {formatPrice(product.price)}
                                </p>

                                <p>
                                    Chất liệu:{" "}
                                    {product.material || "Chưa cập nhật"}
                                </p>

                                <p>
                                    Màu sắc:{" "}
                                    {product.color || "Chưa cập nhật"}
                                </p>

                                <button
                                    type="button"
                                    className="detail-btn"
                                    onClick={() => openProductDetail(product)}
                                >
                                    Xem chi tiết
                                </button>
                            </article>
                        ))}
                    </div>

                    {visibleProducts.length === 0 && (
                        <div className="products-message">
                            <h2>Chưa tìm thấy sản phẩm phù hợp</h2>
                            <p>
                                Bạn hãy thử từ khóa khác hoặc chọn phòng khác.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setKeyword("");
                                    setSelectedRoom("all");
                                }}
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Chi tiết sản phẩm thuộc bảng nội thất mới */}
            {selectedProduct && (
                <div
                    className="product-modal-backdrop"
                    onClick={() => setSelectedProduct(null)}
                >
                    <section
                        className="product-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="room-product-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="product-modal-close"
                            onClick={() => setSelectedProduct(null)}
                            aria-label="Đóng chi tiết sản phẩm"
                        >
                            ×
                        </button>

                        {selectedProduct.image && (
                            <img
                                src={getImageUrl(selectedProduct.image)}
                                alt={selectedProduct.product_name}
                            />
                        )}

                        <span className="product-room-label">
                            {ROOM_LABELS[selectedProduct.room_label] ||
                                selectedProduct.room_label}
                        </span>

                        <h2 id="room-product-title">
                            {selectedProduct.product_name}
                        </h2>

                        <p className="product-price">
                            {formatPrice(selectedProduct.price)}
                        </p>

                        <p>
                            Mã sản phẩm: {selectedProduct.product_code || "—"}
                        </p>

                        <p>
                            Chất liệu: {selectedProduct.material || "Chưa cập nhật"}
                        </p>

                        <p>
                            Màu sắc: {selectedProduct.color || "Chưa cập nhật"}
                        </p>

                        <p>
                            Mô tả: {selectedProduct.description || "Sản phẩm nội thất HOMEAI."}
                        </p>

                        <button
                            type="button"
                            className="detail-btn"
                            onClick={() => setSelectedProduct(null)}
                        >
                            Đóng chi tiết
                        </button>
                    </section>
                </div>
            )}
        </main>
    );
}

export default Products;
