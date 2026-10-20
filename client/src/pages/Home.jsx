
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const categories = [
  {
    name: "Phòng khách",
    desc: "Nơi kết nối những khoảnh khắc",
    image: "photo-1600210492486-724fe5c67fb0",
  },
  {
    name: "Phòng ngủ",
    desc: "Không gian nghỉ ngơi thư thái",
    image: "photo-1616486338812-3dadae4b4ace",
  },
  {
    name: "Phòng ăn",
    desc: "Ấm cúng trong từng bữa ăn",
    image: "photo-1600607687939-ce8a6c25118c",
  },
];

const productImages = [
  "photo-1555041469-a586c61ea9bc",
  "photo-1493663284031-b7e3aefcae8e",
  "photo-1616486029423-aaa4789e8c9a",
  "photo-1592078615290-033ee584e267",
];

const bannerImages = [
  "photo-1600210492486-724fe5c67fb0",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1600607687920-4e2a09cf159d",
];

const photo = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((current) => (current + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(
          "http://localhost:5001/api/products"
        );

        if (!response.ok) {
          throw new Error("Không tải được sản phẩm");
        }

        const result = await response.json();
        const list = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        setProducts(list.slice(0, 4));
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="home-page">
      {/* BANNER TRANG CHỦ */}
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">
            HOMEAI — SMART INTERIOR
          </span>

          <h1>
            Không gian đẹp.
            <br />
            Sống theo cách riêng.
          </h1>

          <p>
            Khám phá nội thất tinh tế và tìm cảm hứng thiết kế
            cho ngôi nhà của bạn cùng HOMEAI.
          </p>

          <div className="home-actions">
            <Link to="/products" className="home-button">
              Khám phá bộ sưu tập <span>↗</span>
            </Link>

            <Link to="/ai-design" className="home-secondary-link">
              Trải nghiệm tư vấn AI →
            </Link>
          </div>

          <div className="home-note">
            <span className="home-note-dot" />
            <span>
              Thiết kế phù hợp với phong cách của bạn
            </span>
          </div>
        </div>

        <div className="home-hero-image">
          {bannerImages.map((image, index) => (
            <img
              key={image}
              src={photo(image)}
              alt={`Không gian nội thất ${index + 1}`}
              className={`home-hero-slide ${
                index === bannerIndex ? "active" : ""
              }`}
            />
          ))}

          <div className="home-image-label">
            <span>THE ART OF LIVING</span>
            <strong>Less, but better.</strong>
          </div>

          <div className="home-banner-dots">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                type="button"
                className={index === bannerIndex ? "active" : ""}
                onClick={() => setBannerIndex(index)}
                aria-label={`Chuyển đến ảnh ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <span className="home-hero-number">
          0{bannerIndex + 1} — 0{bannerImages.length}
        </span>
      </section>

      {/* DANH MỤC KHÔNG GIAN */}
      <section className="home-section home-category-section">
        <div className="home-heading">
          <div>
            <span className="home-eyebrow">TÌM CẢM HỨNG</span>
            <h2>Mỗi căn phòng, một câu chuyện</h2>
          </div>

          <Link to="/products" className="home-view-all">
            Xem tất cả sản phẩm ↗
          </Link>
        </div>

        <div className="home-category-grid">
          {categories.map((category, index) => (
            <Link
              to={`/products?category=${encodeURIComponent(
                category.name
              )}`}
              className="home-category-card"
              key={category.name}
            >
              <div className="home-category-image">
                <img
                  src={photo(category.image)}
                  alt={category.name}
                />

                <span className="home-category-index">
                  0{index + 1}
                </span>

                <span className="home-category-arrow">↗</span>
              </div>

              <div className="home-category-info">
                <h3>{category.name}</h3>
                <p>{category.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SẢN PHẨM NỔI BẬT */}
      <section className="home-section home-products-section">
        <div className="home-heading">
          <div>
            <span className="home-eyebrow">
              LỰA CHỌN DÀNH CHO BẠN
            </span>

            <h2>Sản phẩm nổi bật</h2>

            <p className="home-section-desc">
              Hoàn thiện không gian sống với những thiết kế
              được tuyển chọn.
            </p>
          </div>

          <Link to="/products" className="home-view-all">
            Khám phá cửa hàng ↗
          </Link>
        </div>

        {loading ? (
          <p className="home-status">
            Đang tải sản phẩm...
          </p>
        ) : products.length === 0 ? (
          <p className="home-status">
            Chưa có sản phẩm. Bạn hãy kiểm tra máy chủ
            và dữ liệu sản phẩm nhé.
          </p>
        ) : (
          <div className="home-product-grid">
            {products.map((product, index) => {
              const image =
                product.image_url ||
                product.image ||
                photo(productImages[index % productImages.length]);

              return (
                <article
                  className="home-product-card"
                  key={product.product_id}
                >
                  <Link
                    to={`/products/${product.product_id}`}
                    className="home-product-image"
                  >
                    <img
                      src={image}
                      alt={product.product_name}
                    />

                    <span className="home-product-badge">
                      HOMEAI SELECT
                    </span>

                    <span className="home-product-open">↗</span>
                  </Link>

                  <div className="home-product-info">
                    <span className="home-product-category">
                      {product.material || "Nội thất hiện đại"}
                    </span>

                    <h3>
                      <Link to={`/products/${product.product_id}`}>
                        {product.product_name}
                      </Link>
                    </h3>

                    <div className="home-product-bottom">
                      <strong>
                        {Number(product.price || 0).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        ₫
                      </strong>

                      <Link to={`/products/${product.product_id}`}>
                        Chi tiết →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* TƯ VẤN THIẾT KẾ AI */}
      <section className="home-ai-section">
        <div className="home-ai-visual">
          <img
            src={photo("photo-1600566753086-00f18fb6b3ea")}
            alt="Không gian nội thất hiện đại"
          />

          <span className="home-ai-stamp">
            DESIGN
            <br />
            SMARTER
          </span>
        </div>

        <div className="home-ai-content">
          <span className="home-eyebrow">
            YOUR PERSONAL AI DESIGNER
          </span>

          <h2>
            Ngôi nhà trong mơ, bắt đầu từ một ý tưởng.
          </h2>

          <p>
            Chia sẻ diện tích, phong cách yêu thích và ngân sách
            dự kiến. HOMEAI hướng đến việc giúp bạn tìm ra lựa
            chọn phù hợp hơn.
          </p>

          <Link to="/ai-design" className="home-button">
            Khám phá tư vấn AI <span>↗</span>
          </Link>

          <div className="home-ai-caption">
            <span>01</span>
            <span>Gợi ý theo nhu cầu của bạn</span>
          </div>
        </div>
      </section>

      {/* ĐIỂM NỔI BẬT */}
      <section className="home-benefits">
        <div>
          <span>01 / DISCOVER</span>
          <h3>Khám phá dễ dàng</h3>
          <p>
            Tìm kiếm sản phẩm theo nhu cầu và không gian sống.
          </p>
        </div>

        <div>
          <span>02 / INSPIRE</span>
          <h3>Tìm phong cách riêng</h3>
          <p>
            Tham khảo ý tưởng để hoàn thiện ngôi nhà của bạn.
          </p>
        </div>

        <div>
          <span>03 / DESIGN</span>
          <h3>Đồng hành cùng AI</h3>
          <p>
            Tiếp cận gợi ý thiết kế phù hợp với nhu cầu cá nhân.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Home;
