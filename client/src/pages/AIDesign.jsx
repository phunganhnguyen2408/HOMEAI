import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bot,
    Send,
    Sparkles,
    Sofa,
    BedDouble,
    CookingPot,
    UserRound,
    ArrowUpRight,
    WandSparkles,
} from "lucide-react";
import "../styles/ai-design.css";
import { getProductImageUrl } from "../productImages";
import { API_URL } from "../config/api";

const suggestions = [
    {
        icon: Sofa,
        title: "Phòng khách hiện đại",
        description: "Ấm cúng, tinh tế, tối ưu diện tích",
        prompt: "Thiết kế phòng khách hiện đại, ấm cúng và tối ưu diện tích."
    },
    {
        icon: BedDouble,
        title: "Phòng ngủ thư giãn",
        description: "Màu sắc nhẹ nhàng, dễ nghỉ ngơi",
        prompt: "Tư vấn thiết kế phòng ngủ nhẹ nhàng, thư giãn với ngân sách hợp lý."
    },
    {
        icon: CookingPot,
        title: "Phòng bếp tiện nghi",
        description: "Gọn gàng, tiện dụng, dễ vệ sinh",
        prompt: "Thiết kế phòng bếp hiện đại, tiện nghi và tiết kiệm không gian."
    }
];

function AIDesign() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Xin chào! Mình là trợ lý thiết kế HOMEAI. Hãy kể cho mình nghe về không gian bạn muốn thay đổi, phong cách yêu thích và ngân sách dự kiến nhé!"
        }
    ]);

    const chooseSuggestion = (prompt) => {
        setMessage(prompt);
    };

  
const sendMessage = async (event) => {
    event?.preventDefault();

    const content = message.trim();

    if (!content || isLoading) return;

    setMessages((current) => [
        ...current,
        { role: "user", content }
    ]);

    setMessage("");
    setIsLoading(true);

    const updateAssistantMessage = (updates) => {
        setMessages((current) => {
            const lastMessage = current[current.length - 1];
            if (lastMessage?.role === "assistant") {
                return [
                    ...current.slice(0, -1),
                    { ...lastMessage, ...updates }
                ];
            }

            return [...current, { role: "assistant", ...updates }];
        });
    };

    try {
        const response = await fetch(`${API_URL}/api/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: content })
        });

        if (!response.ok || !response.headers.get("content-type")?.includes("text/event-stream")) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.message || "Không thể nhận phản hồi từ AI.");
        }

        if (!response.body) {
            throw new Error("Trình duyệt không hỗ trợ nhận phản hồi trực tiếp.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamedReply = "";
        let receivedFinalResponse = false;

        while (true) {
            const { done, value } = await reader.read();
            buffer += decoder.decode(value, { stream: !done });

            const events = buffer.split(/\r?\n\r?\n/);
            buffer = events.pop() || "";

            for (const eventBlock of events) {
                const eventName =
                    eventBlock.match(/^event:\s*(.+)$/m)?.[1] || "message";
                const dataLine = eventBlock
                    .split(/\r?\n/)
                    .filter((line) => line.startsWith("data:"))
                    .map((line) => line.slice(5).trim())
                    .join("\n");

                if (!dataLine) continue;

                const data = JSON.parse(dataLine);
                if (eventName === "chunk") {
                    streamedReply += data.text || "";
                    updateAssistantMessage({
                        content: streamedReply
                            .replace(/\s*\[PRODUCT_IDS:[\s\S]*$/i, "")
                            .trimStart()
                    });
                } else if (eventName === "done") {
                    receivedFinalResponse = true;
                    updateAssistantMessage({
                        content: data.reply,
                        products: Array.isArray(data.recommendedProducts)
                            ? data.recommendedProducts
                            : []
                    });
                } else if (eventName === "error") {
                    throw new Error(data.message || "AI chưa thể trả lời lúc này.");
                }
            }

            if (done) break;
        }

        if (!receivedFinalResponse) {
            throw new Error("Phản hồi từ AI bị gián đoạn. Bạn hãy thử lại nhé.");
        }
    } catch (error) {
        console.error("Lỗi khi gọi AI:", error);

        updateAssistantMessage({
            content: error.message || "HOMEAI chưa thể trả lời lúc này. Bạn hãy thử lại nhé!"
        });
    } finally {
        setIsLoading(false);
    }
};


    return (
        <main className="ai-design-page">
            <section className="ai-hero">
                <div className="ai-hero-content">
                    <span className="ai-eyebrow">
                        <Sparkles size={15} />
                        HOMEAI SMART DESIGN
                    </span>

                    <h1>
                        Không gian mơ ước,
                        <br />
                        <span>bắt đầu từ ý tưởng của bạn.</span>
                    </h1>

                    <p>
                        Chia sẻ mong muốn của bạn. HOMEAI sẽ giúp bạn khám phá
                        phong cách nội thất, cách bố trí và những lựa chọn phù hợp.
                    </p>

                    <div className="ai-hero-features">
                        <span><WandSparkles size={17} /> Tư vấn theo nhu cầu</span>
                        <span><Sofa size={17} /> Gợi ý nội thất</span>
                    </div>
                </div>

                <div className="ai-hero-card">
                    <div className="ai-hero-card-icon">
                        <Bot size={30} />
                    </div>
                    <span className="ai-card-caption">YOUR PERSONAL DESIGNER</span>
                    <h2>Thiết kế theo cách của bạn</h2>
                    <p>
                        Từ một ý tưởng nhỏ đến kế hoạch hoàn thiện không gian sống.
                    </p>
                    <div className="ai-card-line" />
                    <div className="ai-card-bottom">
                        <span>HOMEAI Studio</span>
                        <Sparkles size={18} />
                    </div>
                </div>
            </section>

            <section className="ai-workspace">
                <div className="ai-section-heading">
                    <div>
                        <span className="ai-small-label">BẮT ĐẦU KHÁM PHÁ</span>
                        <h2>Bạn muốn thiết kế không gian nào?</h2>
                    </div>
                    <p>Chọn một gợi ý hoặc nhập ý tưởng riêng của bạn.</p>
                </div>

                <div className="ai-suggestion-grid">
                    {suggestions.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                className="ai-suggestion-card"
                                type="button"
                                key={item.title}
                                onClick={() => chooseSuggestion(item.prompt)}
                            >
                                <span className="ai-suggestion-icon">
                                    <Icon size={23} />
                                </span>
                                <span className="ai-suggestion-text">
                                    <strong>{item.title}</strong>
                                    <small>{item.description}</small>
                                </span>
                                <ArrowUpRight
                                    className="ai-suggestion-arrow"
                                    size={19}
                                />
                            </button>
                        );
                    })}
                </div>

                <div className="ai-chat">
                    <div className="ai-chat-header">
                        <div className="ai-chat-title">
                            <div className="ai-bot-avatar">
                                <Bot size={23} />
                            </div>
                            <div>
                                <h3>Trợ lý thiết kế HOMEAI</h3>
                                <p>Không gian của bạn bắt đầu từ đây</p>
                            </div>
                        </div>
                        <span className="ai-chat-tag">
                            <Sparkles size={14} /> SMART DESIGN
                        </span>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map((item, index) => (
                            <div
                                key={index}
                                className={`ai-message ${
                                    item.role === "user"
                                        ? "user-message"
                                        : "assistant-message"
                                }`}
                            >
                                <div className="ai-message-avatar">
                                    {item.role === "user" ? (
                                        <UserRound size={17} />
                                    ) : (
                                        <Bot size={18} />
                                    )}
                                </div>
                                <div className="ai-message-body">
                                    <span className="ai-message-name">
                                        {item.role === "user"
                                            ? "Bạn"
                                            : "HOMEAI Assistant"}
                                    </span>
                                    <div className="message-content">
                                        {item.content}
                                    </div>
                                    {item.products?.length > 0 && (
                                        <div className="ai-recommendations">
                                            <span>Sản phẩm HOMEAI phù hợp</span>
                                            <div className="ai-product-grid">
                                                {item.products.map((product) => {
                                                    const image = getProductImageUrl(product.image);

                                                    return (
                                                        <button
                                                            className="ai-product-card"
                                                            key={product.product_id}
                                                            type="button"
                                                            onClick={() => navigate(`/products/${product.product_id}`)}
                                                        >
                                                            {product.image && (
                                                                <img src={image} alt={product.product_name} />
                                                            )}
                                                            <strong>{product.product_name}</strong>
                                                            <small>
                                                                {Number(product.price || 0).toLocaleString("vi-VN")} VNĐ
                                                            </small>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                                            {isLoading && (
                            <div className="ai-message assistant-message">
                                <div className="ai-message-avatar">
                                    <Bot size={18} />
                                </div>

                                <div className="ai-message-body">
                                    <span className="ai-message-name">
                                        HOMEAI Assistant
                                    </span>

                                    <div className="message-content">
                                        HOMEAI đang tư vấn cho bạn...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <form className="ai-chat-form" onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Mô tả căn phòng, phong cách hoặc ngân sách..."
                            aria-label="Nhập yêu cầu thiết kế"
                        />
                    <button
                       type="submit"
                       aria-label="Gửi yêu cầu"
                       disabled={isLoading || !message.trim()}>
                    <span>
                       {isLoading ? "Đang xử lý..." : "Gửi yêu cầu"}
                    </span>
                       <Send size={17} />
                    </button>
                    </form>

                    <p className="ai-chat-note">
                        <Sparkles size={13} />
                        Mô tả càng rõ, gợi ý thiết kế càng sát với nhu cầu của bạn.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default AIDesign;
