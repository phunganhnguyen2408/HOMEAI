
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
const pool = require("./config/db");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const accountRoutes = require("./routes/account");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/orders", orderRoutes);

// Kiểm tra backend
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "HOMEAI Backend đang hoạt động!"
    });
});

// Kiểm tra kết nối MySQL
app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        res.json({
            success: true,
            message: "Kết nối MySQL thành công!",
            data: rows
        });
    } catch (error) {
        console.error("Lỗi MySQL:", error);
        res.status(500).json({
            success: false,
            message: "Kết nối MySQL thất bại!"
        });
    }
});

// Lấy danh sách sản phẩm hiện có
app.get("/api/products", async (req, res) => {
    try {
        const [products] = await pool.query(
            "SELECT * FROM products"
        );

        res.json({
            success: true,
            message: "Lấy danh sách sản phẩm thành công!",
            data: products
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);

        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách sản phẩm!"
        });
    }
});

// Lấy chi tiết sản phẩm
app.get("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await pool.query(
            "SELECT * FROM products WHERE product_id = ?",
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm!"
            });
        }

        res.json({
            success: true,
            message: "Lấy chi tiết sản phẩm thành công!",
            data: products[0]
        });
    } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);

        res.status(500).json({
            success: false,
            message: "Không thể lấy sản phẩm!"
        });
    }
});

// Danh sách sản phẩm nội thất
app.get("/api/room-products", async (req, res) => {
    try {
        const [products] = await pool.query(
            `SELECT *
             FROM homeai_room_products
             WHERE status = 'ACTIVE'
             ORDER BY id ASC`
        );

        res.json({
            success: true,
            message: "Lấy sản phẩm nội thất thành công!",
            total: products.length,
            data: products
        });
    } catch (error) {
        console.error("Lỗi lấy sản phẩm nội thất:", error);

        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách sản phẩm nội thất!"
        });
    }
});

// Chi tiết sản phẩm nội thất theo ID
app.get("/api/room-products/id/:id", async (req, res) => {
    try {
        const [products] = await pool.query(
            `SELECT *
             FROM homeai_room_products
             WHERE id = ? AND status = 'ACTIVE'`,
            [req.params.id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm!"
            });
        }

        const product = {
            ...products[0],
            product_id: `room-${products[0].id}`
        };

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error("Lỗi chi tiết sản phẩm nội thất:", error);

        res.status(500).json({
            success: false,
            message: "Không thể lấy chi tiết sản phẩm!"
        });
    }
});

// Lọc sản phẩm nội thất theo phòng
app.get("/api/room-products/:room", async (req, res) => {
    try {
        const { room } = req.params;

        const allowedRooms = [
            "living_room",
            "bedroom",
            "kitchen"
        ];

        if (!allowedRooms.includes(room)) {
            return res.status(400).json({
                success: false,
                message: "Phòng không hợp lệ!"
            });
        }

        const [products] = await pool.query(
            `SELECT *
             FROM homeai_room_products
             WHERE room = ? AND status = 'ACTIVE'
             ORDER BY id ASC`,
            [room]
        );

        res.json({
            success: true,
            message: "Lấy sản phẩm theo phòng thành công!",
            total: products.length,
            data: products
        });
    } catch (error) {
        console.error("Lỗi lọc sản phẩm theo phòng:", error);

        res.status(500).json({
            success: false,
            message: "Không thể lọc sản phẩm theo phòng!"
        });
    }
});

// Trợ lý AI thiết kế nội thất HOMEAI
app.post("/api/ai/chat", async (req, res) => {
    try {
        const message = req.body?.message;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Bạn hãy nhập nội dung cần tư vấn."
            });
        }

        if (message.length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Nội dung tối đa 2000 ký tự."
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || !apiKey.trim()) {
            console.error(
                "AI CONFIG ERROR: Thiếu GEMINI_API_KEY trong server/.env"
            );

            return res.status(500).json({
                success: false,
                message: "Backend chưa cấu hình GEMINI_API_KEY."
            });
        }

        // Lấy sản phẩm từ database.
        // Không lọc status ở bảng products cũ để tránh giả định
        // bảng này bắt buộc phải có cột status.
        const [oldProducts] = await pool.query(
            "SELECT * FROM products LIMIT 30"
        );

        const [roomProducts] = await pool.query(
            `SELECT *
             FROM homeai_room_products
             WHERE status = 'ACTIVE'
             ORDER BY id ASC`
        );

        const products = [
            ...oldProducts.map((product) => ({
                ...product,
                product_type: "Sản phẩm hiện có",
                recommendation_key: `old:${product.product_id}`
            })),

            ...roomProducts.map((product) => ({
                ...product,
                product_id: `room-${product.id}`,
                room_product_id: product.id,
                product_type: "Sản phẩm nội thất theo phòng",
                recommendation_key: `room:${product.id}`
            }))
        ];

        const ai = new GoogleGenAI({
            apiKey
        });

        const promptProducts = products.map((product) => ({
            product_id: product.product_id,
            product_name: product.product_name,
            price: product.price,
            room: product.room,
            description: product.description,
            material: product.material,
            color: product.color,
            recommendation_key: product.recommendation_key
        }));

        const prompt = `
Bạn là trợ lý thiết kế nội thất HOMEAI. Trả lời tiếng Việt, thân thiện, ngắn gọn (tối đa 100 từ), đưa ra lời khuyên dễ áp dụng.

Yêu cầu: ${message.trim()}

Sản phẩm hiện có:
${JSON.stringify(promptProducts)}

Ưu tiên sản phẩm phù hợp với phòng và ngân sách. Không bịa tên, giá hay mã. Chỉ đề xuất tối đa 3 sản phẩm, dùng đúng recommendation_key trong dữ liệu. Kết thúc bằng đúng một dòng: [PRODUCT_IDS: old:ID,room:ID]. Nếu không có gợi ý, dùng [PRODUCT_IDS:].
        `;

        res.status(200).set({
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no"
        });
        res.flushHeaders();

        const sendEvent = (event, data) => {
            if (!res.writableEnded) {
                res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            }
        };

        const stream = await ai.models.generateContentStream({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                maxOutputTokens: 1200,
                temperature: 0.4,
                thinkingConfig: {
                    thinkingBudget: 0
                }
            }
        });

        let rawReply = "";
        for await (const chunk of stream) {
            const text = chunk.text || "";
            if (text) {
                rawReply += text;
                sendEvent("chunk", { text });
            }
        }

        if (!rawReply.trim()) {
            console.error(
                "Gemini trả về nội dung rỗng."
            );

            sendEvent("error", {
                message: "AI chưa tạo được câu trả lời. Bạn hãy thử lại."
            });
            return res.end();
        }

        const productIdsMatch = rawReply.match(
            /\[PRODUCT_IDS:\s*([^\]]*)\]/i
        );

        const recommendedIds = new Set(
            (productIdsMatch?.[1] || "")
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean)
        );

        const recommendedProducts = products.filter((product) =>
            recommendedIds.has(product.recommendation_key)
        );

        const reply = rawReply
            .replace(/\s*\[PRODUCT_IDS:\s*[^\]]*\]\s*/i, "")
            .trim();

        console.log("HOMEAI AI: Tư vấn thành công.");

        sendEvent("done", { reply, recommendedProducts });
        res.end();
    } catch (error) {
        // In đầy đủ thông tin lỗi để xác định nguyên nhân thật.
        console.error("========== HOMEAI AI ERROR ==========");
        console.error("Message:", error?.message || error);
        console.error("Status:", error?.status || error?.statusCode || "N/A");
        console.error("Code:", error?.code || "N/A");

        if (error?.cause) {
            console.error("Cause:", error.cause);
        }

        console.error("=====================================");

        const errorText = String(
            error?.message || ""
        ).toLowerCase();

        const status = error?.status || error?.statusCode;
        const sendError = (httpStatus, message) => {
            if (res.headersSent) {
                res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
                return res.end();
            }

            return res.status(httpStatus).json({ success: false, message });
        };

        if (
            status === 401 ||
            status === 403 ||
            errorText.includes("api key") ||
            errorText.includes("api_key_invalid") ||
            errorText.includes("unauthenticated") ||
            errorText.includes("permission denied")
        ) {
            return sendError(
                502,
                "Gemini từ chối xác thực. Hãy kiểm tra API key và quyền sử dụng API."
            );
        }

        if (
            status === 429 ||
            errorText.includes("resource_exhausted") ||
            errorText.includes("quota")
        ) {
            return sendError(
                503,
                "Gemini đã vượt hạn mức hoặc giới hạn yêu cầu. Vui lòng thử lại sau."
            );
        }

        if (
            status === 503 ||
            status === 504 ||
            errorText.includes("service unavailable") ||
            errorText.includes("overloaded")
        ) {
            return sendError(
                503,
                "Dịch vụ Gemini đang bận. Vui lòng thử lại sau."
            );
        }

        sendError(
            500,
            "AI chưa thể trả lời. Hãy xem lỗi chi tiết trong terminal backend."
        );
    }
});

// Gửi thông tin liên hệ
app.post("/api/contact", async (req, res) => {
    try {
        const { full_name, email, subject, message } = req.body;

        if (
            typeof full_name !== "string" ||
            typeof email !== "string" ||
            typeof subject !== "string" ||
            typeof message !== "string" ||
            !full_name.trim() ||
            !email.trim() ||
            !subject.trim() ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ thông tin liên hệ!"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Địa chỉ email không hợp lệ!"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO contact_messages
                (full_name, email, subject, message)
             VALUES (?, ?, ?, ?)`,
            [
                full_name.trim(),
                email.trim(),
                subject.trim(),
                message.trim()
            ]
        );

        res.status(201).json({
            success: true,
            message: "Gửi liên hệ thành công! HOMEAI sẽ phản hồi bạn qua email.",
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        console.error("Lỗi lưu liên hệ:", error);

        res.status(500).json({
            success: false,
            message: "Không thể gửi liên hệ lúc này. Vui lòng thử lại!"
        });
    }
});

app.listen(PORT, () => {
    console.log(`HOMEAI backend running at http://localhost:${PORT}`);
});
