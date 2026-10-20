const express = require("express");
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticateToken);

router.get("/", async (req, res) => {
    try {
        const [customers] = await pool.query(
            `SELECT c.customer_id
             FROM customers c
             JOIN users u ON u.user_id = c.user_id
             WHERE u.email = ?
             LIMIT 1`,
            [req.user.email]
        );

        if (!customers.length) {
            return res.json({
                success: true,
                data: {
                    user: req.user,
                    summary: { total_orders: 0, total_spent: 0 },
                    orders: []
                }
            });
        }

        const customerId = customers[0].customer_id;
        const [[summaryRows], [orderRows]] = await Promise.all([
            pool.query(
                `SELECT COUNT(*) AS total_orders,
                        COALESCE(SUM(final_amount), 0) AS total_spent
                 FROM orders
                 WHERE customer_id = ?`,
                [customerId]
            ),
            pool.query(
                `SELECT order_id, order_code, final_amount, order_status,
                        payment_status, payment_method, created_at
                 FROM orders
                 WHERE customer_id = ?
                 ORDER BY created_at DESC
                 LIMIT 10`,
                [customerId]
            )
        ]);

        return res.json({
            success: true,
            data: { user: req.user, summary: summaryRows[0], orders: orderRows }
        });
    } catch (error) {
        console.error("Lỗi tải thông tin tài khoản:", error);
        return res.status(500).json({
            success: false,
            message: "Không thể tải tài khoản."
        });
    }
});

module.exports = router;
