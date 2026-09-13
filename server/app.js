const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5001;


// Kiểm tra Backend
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

        console.log("Lỗi MySQL:", error.message);

        res.status(500).json({
            success: false,
            message: "Kết nối MySQL thất bại!",
            error: error.message
        });

    }

});
app.get("/api/products", async (req, res) => {

    try {

        // Lấy sản phẩm từ bảng products
        const [products] = await pool.query(
            "SELECT * FROM products"
        );

        // Trả dữ liệu về cho Frontend
        res.json({
            success: true,
            message: "Lấy danh sách sản phẩm thành công!",
            data: products
        });

    } catch (error) {

        // Hiển thị lỗi trong Terminal
        console.log("Lỗi lấy sản phẩm:", error.message);

        // Trả thông báo lỗi
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách sản phẩm!",
            error: error.message
        });

    }

});

// Chạy Backend
app.listen(PORT, () => {
    console.log(`HOMEAI Server đang chạy tại http://localhost:${PORT}`);
});