import { useMemo, useState } from "react";
import { projectList, categories, formatPrice } from "./projectData";
import "../styles/projects.css";
import { useNavigate } from "react-router-dom";

function Projects() {
  const [selectedRoom, setSelectedRoom] = useState("Tất cả");
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const filteredProjects = useMemo(() => {
    return projectList.filter((project) => {
      const matchesRoom =
        selectedRoom === "Tất cả" || project.room === selectedRoom;

      const searchText =
        `${project.name} ${project.style} ${project.room}`.toLowerCase();

      const matchesKeyword = searchText.includes(keyword.toLowerCase());

      return matchesRoom && matchesKeyword;
    });
  }, [selectedRoom, keyword]);

  return (
    <main className="projects-page">
      <section className="projects-hero">
        <div className="projects-hero-content">
          <span className="projects-label">
            HOMEAI SMART INTERIOR
          </span>

          <h1>
            Không gian đẹp,
            <br />
            <span>phong cách của riêng bạn.</span>
          </h1>

          <p>
            Khám phá những ý tưởng thiết kế nội thất được tuyển chọn,
            tìm cảm hứng và tạo nên không gian sống lý tưởng cùng HOMEAI.
          </p>

          <a href="#project-library" className="projects-hero-button">
            Khám phá dự án
            <span aria-hidden="true"> ↘</span>
          </a>

          <div className="projects-hero-note">
            <span className="projects-status-dot" />
            Khám phá các phong cách nội thất nổi bật
          </div>
        </div>

        <div className="projects-hero-image">
          <img
            src={projectList[0].image}
            alt="Không gian phòng khách hiện đại"
          />

          <div className="projects-image-caption">
            <span>KHÔNG GIAN SỐNG</span>
            <strong>Modern Living</strong>
          </div>
        </div>
      </section>

      <section className="projects-stats">
        <div>
          <strong>06</strong>
          <span>Ý tưởng thiết kế mẫu</span>
        </div>

        <div>
          <strong>03</strong>
          <span>Không gian tiêu biểu</span>
        </div>

        <div>
          <strong>HOMEAI</strong>
          <span>Cảm hứng cho ngôi nhà Việt</span>
        </div>
      </section>

      <section
        className="projects-content"
        id="project-library"
      >
        <div className="projects-section-heading">
          <div>
            <span className="projects-eyebrow">
              KHÔNG GIAN CỦA BẠN
            </span>

            <h2>Khám phá dự án mẫu</h2>

            <p>
              Tìm kiếm ý tưởng phù hợp với sở thích và nhu cầu của bạn.
            </p>
          </div>

          <span className="projects-result-count">
            {filteredProjects.length} dự án
          </span>
        </div>

        <div className="projects-filters">
          <div className="projects-category-list">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedRoom === category
                    ? "projects-filter active"
                    : "projects-filter"
                }
                onClick={() => setSelectedRoom(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <label className="projects-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Tìm phong cách, dự án..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              aria-label="Tìm kiếm dự án"
            />
          </label>
        </div>

        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <article className="projects-card" key={project.id}>
              <div className="projects-card-image">
                <img
                  src={project.image}
                  alt={project.name}
                  loading="lazy"
                />

                <span className="projects-room-tag">
                  {project.room}
                </span>

                <span className="projects-card-number">
                  {String(project.id).padStart(2, "0")}
                </span>
              </div>

              <div className="projects-card-body">
                <span className="projects-card-style">
                  {project.style}
                </span>

                <h3>{project.name}</h3>

                <p className="projects-card-description">
                  {project.description}
                </p>

                <div className="projects-card-info">
                  <div>
                    <span>Diện tích</span>
                    <strong>{project.area} m²</strong>
                  </div>

                  <div>
                    <span>Chi phí tham khảo</span>
                    <strong>{formatPrice(project.budget)}</strong>
                  </div>
                </div>

                
        <button
                type="button"
                className="projects-detail-button"
                onClick={() => navigate(`/projects/${project.id}`)}>
                Khám phá dự án
            <span aria-hidden="true"> ↗</span>
        </button>

              </div>
            </article>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="projects-no-results">
            <h3>Chưa tìm thấy dự án phù hợp</h3>
            <p>Thử từ khóa khác hoặc chọn một danh mục khác bạn nhé.</p>

            <button
              type="button"
              onClick={() => {
                setSelectedRoom("Tất cả");
                setKeyword("");
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        <div className="projects-ai-banner">
          <div>
            <span className="projects-eyebrow">
              THIẾT KẾ CÙNG TRÍ TUỆ NHÂN TẠO
            </span>

            <h2>Ý tưởng của bạn, không gian của bạn.</h2>

            <p>
              Hãy bắt đầu từ một phong cách yêu thích và phát triển
              ý tưởng thiết kế phù hợp với nhu cầu của riêng bạn.
            </p>
          </div>

          <span className="projects-ai-symbol" aria-hidden="true">
            ✳
          </span>
        </div>
      </section>
    </main>
  );
}

export default Projects;
