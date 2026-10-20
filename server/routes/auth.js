const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const router = express.Router();
const {
    authenticateToken
} = require("../middleware/authMiddleware");

const isActive = (status) => String(status || "").trim().toUpperCase() === "ACTIVE";
const normalizeRole = (role) => String(role || "").trim().toUpperCase();

// API đăng ký tài khoản khách hàng
router.post("/register", async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        // Kiểm tra thông tin bắt buộc
        if (
            !full_name?.trim() ||
            !email?.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ."
            });
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu phải có ít nhất 8 ký tự."
            });
        }

        // Kiểm tra email đã được đăng ký chưa
        const [existingUsers] = await pool.query(
            "SELECT user_id FROM homeai_users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email này đã được đăng ký."
            });
        }

        // Mã hóa mật khẩu trước khi lưu
        const passwordHash = await bcrypt.hash(password, 12);

        // Tạo tài khoản khách hàng, không nhận role từ người dùng
        const [result] = await pool.query(
            `INSERT INTO homeai_users
                (full_name, email, password_hash, role)
             VALUES (?, ?, ?, 'CUSTOMER')`,
            [
                full_name.trim(),
                normalizedEmail,
                passwordHash
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản HOMEAI thành công!",
            data: {
                user_id: result.insertId,
                full_name: full_name.trim(),
                email: normalizedEmail,
                role: "CUSTOMER"
            }
        });
    } catch (error) {
        console.error("Lỗi đăng ký:", error.message);

        return res.status(500).json({
            success: false,
            message: "Đăng ký thất bại. Vui lòng thử lại."
        });
    }
});
router.get("/me", authenticateToken, (req, res) => {
    return res.json({
        success: true,
        data: {
            user_id: req.user.user_id,
            full_name: req.user.full_name,
            email: req.user.email,
            role: normalizeRole(req.user.role)
        }
    });
});

 // API đăng nhập tài khoản
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mật khẩu."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Tìm tài khoản theo email
        const [users] = await pool.query(
            `SELECT user_id, full_name, email, password_hash, role, status
             FROM homeai_users
             WHERE email = ?`,
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không chính xác."
            });
        }

        const user = users[0];

        // Kiểm tra tài khoản có bị khóa không
        if (!isActive(user.status)) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên."
            });
        }

        // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không chính xác."
            });
        }

        // Lấy khóa bí mật từ file .env
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("Thiếu JWT_SECRET trong file .env");

            return res.status(500).json({
                success: false,
                message: "Máy chủ chưa được cấu hình xác thực."
            });
        }

        // Tạo token đăng nhập có thời hạn
        const token = jwt.sign(
            {
                user_id: user.user_id,
                role: normalizeRole(user.role)
            },
            jwtSecret,
            { expiresIn: "1d" }
        );

        return res.json({
            success: true,
            message: "Đăng nhập thành công!",
            token,
            data: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error.message);

        return res.status(500).json({
            success: false,
            message: "Đăng nhập thất bại. Vui lòng thử lại."
        });
    }
});

module.exports = router;
