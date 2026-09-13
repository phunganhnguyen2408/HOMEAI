import { useEffect, useState } from "react";
import "../styles/products.css";
function Products() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5001/api/products")
            .then((response) => response.json())
            .then((data) => {
                setProducts(data.data);
            })
            .catch((error) => {
                console.log("Lỗi:", error);
            });
    }, []);
    return (
        <div className="products-page">
            <h1>Sản phẩm nội thất</h1>
            <p>Khám phá các sản phẩm nội thất của HOMEAI</p>

            <div className="products-grid">
            {products.map((product) => (
            <div className="products-card" key={product.product_id}>
                <img src="{product.image}" alt="product.product_name"/>
                    <h2>{product.product_name}</h2>
                    <p className="product.price">Giá:{product.price} VNĐ</p>
                    <p>Chất liệu: {product.material}</p>
                    <p>Màu sắc: {product.color}</p>
                    <button>Xem chi tiết</button>
                </div>
            ))}
        </div>
        </div>
    );
}

export default Products;