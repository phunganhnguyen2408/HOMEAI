
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import "../styles/contact.css";

function Contact() {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        subject: "",
        message: ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({
        type: "",
        message: ""
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFeedback({ type: "", message: "" });
        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5001/api/contact",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Không thể gửi liên hệ."
                );
            }

            setFeedback({
                type: "success",
                message: data.message
            });

            setFormData({
                full_name: "",
                email: "",
                subject: "",
                message: ""
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message:
                    error.message ||
                    "Không thể kết nối máy chủ. Bạn hãy thử lại nhé."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="contact-page">
            <section className="contact-hero">
                <span className="contact-eyebrow">
                    HOMEAI SMART INTERIOR
                </span>

                <h1>Chúng tôi luôn sẵn sàng hỗ trợ bạn</h1>

                <p>
                    Bạn cần tư vấn nội thất, hỏi về sản phẩm hoặc cần
                    hỗ trợ đơn hàng? Hãy gửi tin nhắn cho HOMEAI nhé.
                </p>
            </section>

            <section className="contact-container">
                <div className="contact-info">
                    <span className="contact-label">
                        LIÊN HỆ VỚI HOMEAI
                    </span>

                    <h2>Cùng bạn tạo nên không gian sống lý tưởng</h2>

                    <p className="contact-description">
                        Đội ngũ HOMEAI luôn sẵn sàng lắng nghe câu hỏi
                        và góp ý của bạn.
                    </p>

                    <div className="contact-info-item">
                        <div className="contact-icon">
                            <Mail size={21} />
                        </div>
                        <div>
                            <strong>Email</strong>
                            <p>Gửi thông tin qua biểu mẫu liên hệ</p>
                        </div>
                    </div>

                    <div className="contact-info-item">
                        <div className="contact-icon">
                            <Phone size={21} />
                        </div>
                        <div>
                            <strong>Điện thoại</strong>
                            <p>Thông tin hỗ trợ sẽ được cập nhật</p>
                        </div>
                    </div>

                    <div className="contact-info-item">
                        <div className="contact-icon">
                            <MapPin size={21} />
                        </div>
                        <div>
                            <strong>Địa chỉ</strong>
                            <p>HOMEAI – Smart Interior</p>
                        </div>
                    </div>

                    <div className="contact-info-item">
                        <div className="contact-icon">
                            <Clock size={21} />
                        </div>
                        <div>
                            <strong>Thời gian phản hồi</strong>
                            <p>Chúng tôi sẽ phản hồi qua email của bạn</p>
                        </div>
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <h2>Gửi tin nhắn cho chúng tôi</h2>

                    <p className="contact-form-description">
                        Điền thông tin bên dưới để HOMEAI có thể hỗ trợ bạn.
                    </p>

                    <div className="contact-field">
                        <label htmlFor="full_name">Họ và tên</label>
                        <input
                            id="full_name"
                            name="full_name"
                            type="text"
                            placeholder="Nhập họ và tên của bạn"
                            value={formData.full_name}
                            onChange={handleChange}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="contact-field">
                        <label htmlFor="email">Địa chỉ email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="example@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            maxLength={150}
                            required
                        />
                    </div>

                    <div className="contact-field">
                        <label htmlFor="subject">Chủ đề liên hệ</label>
                        <input
                            id="subject"
                            name="subject"
                            type="text"
                            placeholder="Ví dụ: Tư vấn sản phẩm nội thất"
                            value={formData.subject}
                            onChange={handleChange}
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="contact-field">
                        <label htmlFor="message">Nội dung</label>
                        <textarea
                            id="message"
                            name="message"
                            placeholder="Bạn cần HOMEAI hỗ trợ điều gì?"
                            value={formData.message}
                            onChange={handleChange}
                            rows={5}
                            required
                        />
                    </div>

                    {feedback.message && (
                        <div
                            className={`contact-feedback ${feedback.type}`}
                            role="status"
                        >
                            {feedback.message}
                        </div>
                    )}

                    <button
                        className="contact-submit"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Đang gửi..." : "Gửi liên hệ"}
                        {!isLoading && <Send size={18} />}
                    </button>

                    <p className="contact-privacy">
                        Thông tin của bạn được sử dụng để hỗ trợ yêu cầu liên hệ.
                    </p>
                </form>
            </section>
        </main>
    );
}

export default Contact;
