import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/products.css";
import { getProductImageUrl } from "../productImages";

function Favorites() {
    const navigate = useNavigate();
    const [favoriteProducts, setFavoriteProducts] = useState([]);

    useEffect(() => {
        const savedFavorites = JSON.parse(
            localStorage.getItem("homeai_favorites") || "[]"
        );

        Promise.all([
            fetch("http://localhost:5001/api/products"),
            fetch("http://localhost:5001/api/room-products"),
        ])
            .then(async ([oldResponse, roomResponse]) => {
                if (!oldResponse.ok || !roomResponse.ok) {
                    throw new Error("Không thể tải danh sách sản phẩm yêu thích.");
                }

                const [oldData, roomData] = await Promise.all([
                    oldResponse.json(),
                    roomResponse.json(),
                ]);

                const oldProducts = oldData.data || [];
                const roomProducts = (roomData.data || []).map((product) => ({
                    ...product,
                    product_id: `room-${product.id}`,
                }));
                const allProducts = [...oldProducts, ...roomProducts];

                const result = allProducts.filter((product) =>
                    savedFavorites.includes(product.product_id)
                );

                setFavoriteProducts(result);
            })
            .catch((error) => {
                console.log("Lỗi tải sản phẩm yêu thích:", error);
            });
    }, []);

    const removeFavorite = (productId) => {
        const savedFavorites = JSON.parse(
            localStorage.getItem("homeai_favorites") || "[]"
        );

        const updatedFavorites = savedFavorites.filter(
            (id) => id !== productId
        );

        localStorage.setItem(
            "homeai_favorites",
            JSON.stringify(updatedFavorites)
        );

        setFavoriteProducts((current) =>
            current.filter((product) => product.product_id !== productId)
        );
    };

    return (
        <div className="products-page">
            <div className="products-header">
                <h1>Sản phẩm yêu thích ♥</h1>
                <p>Những món nội thất bạn đã lưu tại HOMEAI</p>
            </div>

            {favoriteProducts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <p>Bạn chưa có sản phẩm yêu thích nào.</p>
                    <button
                        className="detail-btn"
                        onClick={() => navigate("/products")}
                    >
                        Khám phá sản phẩm
                    </button>
                </div>
            ) : (
                <div className="products-grid">
                    {favoriteProducts.map((product) => (
                        <div
                            className="product-card"
                            key={product.product_id}
                        >
                            <div className="product-image-wrap">
                                {product.image && (
                                    <img
                                        src={getProductImageUrl(product.image)}
                                        alt={product.product_name}
                                    />
                                )}
                            </div>

                            <h2>{product.product_name}</h2>

                            <p className="product-price">
                                Giá: {Number(product.price).toLocaleString("vi-VN")} VNĐ
                            </p>

                            <p>Chất liệu: {product.material}</p>
                            <p>Màu sắc: {product.color}</p>

                            <button
                                className="detail-btn"
                                onClick={() =>
                                    navigate(`/products/${product.product_id}`)
                                }
                            >
                                Xem chi tiết
                            </button>

                        <button
                                type="button"
                                onClick={() => removeFavorite(product.product_id)}
                                style={{
                                    marginTop: "10px",
                                    padding: "9px",
                                    border: "1px solid #e53950",
                                    borderRadius: "8px",
                                    background: "white",
                                    color: "#e53950",
                                    cursor: "pointer"
                                }}
                        >
                                ♥ Bỏ yêu thích
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Favorites;
