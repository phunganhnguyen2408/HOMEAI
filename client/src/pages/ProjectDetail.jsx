import { useParams, useNavigate } from "react-router-dom";
import { projectList, formatPrice } from "./projectData";
import "../styles/project-detail-page.css";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const project = projectList.find(
    (item) => item.id === Number(id)
  );

  if (!project) {
    return (
      <main className="project-detail-not-found">
        <h2>Không tìm thấy dự án</h2>
        <button onClick={() => navigate("/projects")}>
          Quay lại danh sách dự án
        </button>
      </main>
    );
  }

  const budgetItems = [
    { name: "Nội thất chính", ratio: 45 },
    { name: "Vật liệu và hoàn thiện", ratio: 25 },
    { name: "Ánh sáng và trang trí", ratio: 15 },
    { name: "Thi công và dự phòng", ratio: 15 },
  ];

  const relatedProjects = projectList
    .filter((item) => item.id !== project.id)
    .filter((item) => item.room === project.room)
    .slice(0, 3);

  const displayProjects =
    relatedProjects.length > 0
      ? relatedProjects
      : projectList
          .filter((item) => item.id !== project.id)
          .slice(0, 3);

  return (
    <main className="project-detail-page">
      <div className="project-detail-container">
        <button
          className="project-back-button"
          onClick={() => navigate("/projects")}
        >
          ← Tất cả dự án
        </button>

        <div className="project-detail-breadcrumb">
          Trang chủ <span>/</span> Dự án mẫu <span>/</span>
          <strong>{project.name}</strong>
        </div>

        <section className="project-detail-hero">
          <div className="project-detail-image">
            <img src={project.image} alt={project.name} />

            <span className="project-detail-image-tag">
              HOMEAI DESIGN COLLECTION
            </span>
          </div>

          <div className="project-detail-content">
            <span className="project-detail-label">
              {project.room} · {project.style}
            </span>

            <h1>{project.name}</h1>

            <p className="project-detail-description">
              {project.description} Không gian được định hướng
              theo sự cân bằng giữa thẩm mỹ, công năng và trải
              nghiệm sinh hoạt hằng ngày.
            </p>

            <div className="project-detail-highlights">
              <div>
                <span>⌂</span>
                <p>Không gian</p>
                <strong>{project.room}</strong>
              </div>

              <div>
                <span>▧</span>
                <p>Diện tích</p>
                <strong>{project.area} m²</strong>
              </div>

              <div>
                <span>✳</span>
                <p>Phong cách</p>
                <strong>{project.style}</strong>
              </div>
            </div>

            <div className="project-detail-budget">
              <span>Ngân sách tham khảo</span>
              <strong>{formatPrice(project.budget)}</strong>
              <small>
                Ước tính ban đầu, chưa phải báo giá thi công chính thức.
              </small>
            </div>

            <button
              className="project-detail-ai-button"
              onClick={() => navigate("/ai-design")}
            >
              Tư vấn thiết kế cùng AI <span>↗</span>
            </button>
          </div>
        </section>

        <section className="project-detail-section">
          <div className="project-detail-section-heading">
            <span>01 — THE DESIGN STORY</span>
            <h2>Câu chuyện thiết kế</h2>
            <p>
              Mỗi không gian bắt đầu từ nhu cầu sống và được
              phát triển thành một tổng thể hài hòa.
            </p>
          </div>

          <div className="project-detail-story-grid">
            <article className="project-detail-story-main">
              <span className="project-detail-mini-label">
                Ý TƯỞNG CHỦ ĐẠO
              </span>

              <h3>Đẹp trong từng chi tiết, tiện nghi trong từng trải nghiệm.</h3>

              <p>
                Dự án hướng đến cách tổ chức không gian hợp lý,
                ưu tiên sự thoải mái và tạo điểm nhấn bằng những
                lựa chọn nội thất có chủ đích. Bố cục, màu sắc
                và vật liệu cần được điều chỉnh theo hiện trạng
                thực tế của căn nhà.
              </p>
            </article>

            <article className="project-detail-palette">
              <span className="project-detail-mini-label">
                GỢI Ý BẢNG MÀU
              </span>

              <div className="project-detail-swatches">
                <div className="project-swatch swatch-cream" />
                <div className="project-swatch swatch-wood" />
                <div className="project-swatch swatch-sage" />
                <div className="project-swatch swatch-white" />
              </div>

              <h3>Bảng màu hài hòa</h3>

              <p>
                Có thể tham khảo các tông trung tính, màu gỗ
                tự nhiên và điểm nhấn xanh nhẹ. Bảng màu này
                là gợi ý định hướng, không phải thông số màu
                thực tế của ảnh mẫu.
              </p>
            </article>
          </div>
        </section>

        <section className="project-detail-section">
          <div className="project-detail-section-heading">
            <span>02 — MATERIAL & FINISH</span>
            <h2>Vật liệu và hoàn thiện</h2>
            <p>
              Một số lựa chọn có thể cân nhắc khi phát triển
              ý tưởng thành phương án thực tế.
            </p>
          </div>

          <div className="project-detail-materials">
            <article>
              <div className="project-material-icon">▤</div>
              <h3>Gỗ công nghiệp</h3>
              <p>
                Phù hợp với hệ tủ và đồ nội thất cần tính đồng bộ.
                Nên chọn loại cốt và bề mặt theo ngân sách sử dụng.
              </p>
            </article>

            <article>
              <div className="project-material-icon">◇</div>
              <h3>Vải và chất liệu mềm</h3>
              <p>
                Tạo cảm giác dễ chịu cho khu vực nghỉ ngơi,
                tiếp khách hoặc các góc thư giãn.
              </p>
            </article>

            <article>
              <div className="project-material-icon">☼</div>
              <h3>Ánh sáng</h3>
              <p>
                Kết hợp ánh sáng tự nhiên và đèn chức năng
                để không gian thuận tiện khi sử dụng.
              </p>
            </article>
          </div>
        </section>

        <section className="project-detail-section">
          <div className="project-detail-section-heading">
            <span>03 — ESTIMATED BUDGET</span>
            <h2>Phân bổ ngân sách dự kiến</h2>
            <p>
              Bảng dưới đây là mô hình tham khảo để lập kế hoạch,
              không phải báo giá thực tế từ nhà cung cấp.
            </p>
          </div>

          <div className="project-detail-cost">
            <div className="project-detail-cost-total">
              <span>Tổng ngân sách tham khảo</span>
              <strong>{formatPrice(project.budget)}</strong>
              <p>
                Phân bổ minh họa theo tỷ lệ của từng hạng mục.
              </p>
            </div>

            <div className="project-detail-cost-list">
              {budgetItems.map((item) => (
                <div className="project-cost-item" key={item.name}>
                  <div className="project-cost-label">
                    <span>{item.name}</span>
                    <strong>{item.ratio}%</strong>
                  </div>

                  <div className="project-cost-track">
                    <div
                      className="project-cost-fill"
                      style={{ width: `${item.ratio}%` }}
                    />
                  </div>

                  <p>
                    Khoảng{" "}
                    {formatPrice(
                      Math.round(project.budget * item.ratio / 100)
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="project-detail-section">
          <div className="project-detail-section-heading">
            <span>04 — IMPLEMENTATION</span>
            <h2>Từ ý tưởng đến không gian thực tế</h2>
          </div>

          <div className="project-detail-process">
            <article>
              <span>01</span>
              <h3>Khảo sát nhu cầu</h3>
              <p>Xác định diện tích, thói quen sinh hoạt và ngân sách.</p>
            </article>

            <article>
              <span>02</span>
              <h3>Lên phương án</h3>
              <p>Phát triển bố cục, phong cách và lựa chọn vật liệu.</p>
            </article>

            <article>
              <span>03</span>
              <h3>Hoàn thiện thiết kế</h3>
              <p>Điều chỉnh phương án theo hiện trạng và nhu cầu.</p>
            </article>

            <article>
              <span>04</span>
              <h3>Thi công và bàn giao</h3>
              <p>Thực hiện theo hồ sơ, tiến độ và dự toán được duyệt.</p>
            </article>
          </div>
        </section>

        <section className="project-detail-cta">
          <div>
            <span>YOUR HOME, YOUR STORY</span>
            <h2>Bạn muốn tạo nên không gian của riêng mình?</h2>
            <p>
              Bắt đầu từ nhu cầu, diện tích và ngân sách của bạn
              để phát triển ý tưởng thiết kế phù hợp hơn.
            </p>
          </div>

          <button
            onClick={() => navigate("/ai-design")}
          >
            Bắt đầu tư vấn <span>↗</span>
          </button>
        </section>

        <section className="project-detail-related">
          <div className="project-detail-section-heading">
            <span>YOU MAY ALSO LIKE</span>
            <h2>Dự án bạn có thể yêu thích</h2>
          </div>

          <div className="project-related-grid">
            {displayProjects.map((item) => (
              <article className="project-related-card" key={item.id}>
                <button
                  className="project-related-image"
                  onClick={() => navigate(`/projects/${item.id}`)}
                  aria-label={`Xem dự án ${item.name}`}
                >
                  <img src={item.image} alt={item.name} loading="lazy" />
                </button>

                <span>{item.room} · {item.style}</span>
                <h3>{item.name}</h3>
                <p>{item.area} m² · {formatPrice(item.budget)}</p>

                <button
                  className="project-related-link"
                  onClick={() => navigate(`/projects/${item.id}`)}
                >
                  Xem dự án <span>↗</span>
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProjectDetail;
