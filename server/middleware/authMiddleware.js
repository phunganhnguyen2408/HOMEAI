
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const isActive = (status) => String(status || "").trim().toUpperCase() === "ACTIVE";
const isAdmin = (role) => String(role || "").trim().toUpperCase() === "ADMIN";

// Kiểm tra token và xác minh tài khoản đăng nhập
async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Bạn cần đăng nhập để tiếp tục."
            });
        }

        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            return res.status(500).json({
                success: false,
                message: "Máy chủ chưa cấu hình xác thực."
            });
        }

        const decoded = jwt.verify(token, jwtSecret);

        // Đọc lại quyền hiện tại từ MySQL để tránh dùng quyền cũ
        const [users] = await pool.query(
            `SELECT user_id, full_name, email, role, status
             FROM homeai_users
             WHERE user_id = ?`,
            [decoded.user_id]
        );

        if (users.length === 0 || !isActive(users[0].status)) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản không tồn tại hoặc đã bị khóa."
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
        });
    }
}

// Chỉ cho phép tài khoản ADMIN truy cập
function requireAdmin(req, res, next) {
    if (!req.user || !isAdmin(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Bạn không có quyền quản trị website."
        });
    }

    next();
}

module.exports = {
    authenticateToken,
    requireAdmin
};
