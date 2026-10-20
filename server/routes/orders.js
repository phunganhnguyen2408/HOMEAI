const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const express = require("express");
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticateToken);

function parseOrderItems(items) {
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
        return null;
    }

    const quantities = new Map();
    for (const item of items) {
        const quantity = Number(item?.quantity);
        if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
            return null;
        }

        let type;
        let id;
        if (typeof item.product_id === "string" && item.product_id.startsWith("room-")) {
            type = "room";
            id = Number(item.product_id.slice(5));
        } else {
            type = "product";
            id = Number(item.product_id);
        }

        if (!Number.isSafeInteger(id) || id < 1) {
            return null;
        }

        const key = `${type}:${id}`;
        quantities.set(key, (quantities.get(key) || 0) + quantity);
        if (quantities.get(key) > 99) {
            return null;
        }
    }

    return [...quantities].map(([key, quantity]) => {
        const [type, id] = key.split(":");
        return { type, id: Number(id), quantity };
    });
}

async function findOrCreateCustomer(connection, account) {
    const [existingUsers] = await connection.query(
        `SELECT u.user_id, c.customer_id
         FROM users u
         LEFT JOIN customers c ON c.user_id = u.user_id
         WHERE u.email = ?
         FOR UPDATE`,
        [account.email]
    );
    if (existingUsers[0]?.customer_id) {
        return existingUsers[0].customer_id;
    }

    let userId = existingUsers[0]?.user_id;
    if (!userId) {
        const [roles] = await connection.query(
            "SELECT role_id FROM roles WHERE role_name = 'CUSTOMER' LIMIT 1"
        );
        if (!roles.length) {
            throw new Error("Không tìm thấy vai trò khách hàng trong hệ thống.");
        }

        const passwordHash = await bcrypt.hash(
            crypto.randomBytes(32).toString("hex"),
            12
        );
        const [userResult] = await connection.query(
            `INSERT INTO users (role_id, username, email, password, full_name, status)
             VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
            [
                roles[0].role_id,
                account.email,
                account.email,
                passwordHash,
                account.full_name
            ]
        );
        userId = userResult.insertId;
    }

    const [customerResult] = await connection.query(
        "INSERT INTO customers (user_id) VALUES (?)",
        [userId]
    );
    return customerResult.insertId;
}

router.post("/", async (req, res) => {
    const receiverName = String(req.body?.receiver_name || "").trim();
    const receiverPhone = String(req.body?.receiver_phone || "").trim();
    const address = String(req.body?.address || "").trim();
    const note = String(req.body?.note || "").trim();
    const items = parseOrderItems(req.body?.items);

    if (!receiverName || receiverName.length > 150) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập họ tên người nhận (tối đa 150 ký tự)."
        });
    }
    if (!/^(?:\+?84|0)\d{9,10}$/.test(receiverPhone.replace(/[\s.-]/g, ""))) {
        return res.status(400).json({
            success: false,
            message: "Số điện thoại người nhận không hợp lệ."
        });
    }
    if (!address || address.length > 2000) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập địa chỉ nhận hàng (tối đa 2000 ký tự)."
        });
    }
    if (note.length > 1000) {
        return res.status(400).json({
            success: false,
            message: "Ghi chú tối đa 1000 ký tự."
        });
    }
    if (!items) {
        return res.status(400).json({
            success: false,
            message: "Giỏ hàng không hợp lệ. Hãy kiểm tra lại số lượng sản phẩm."
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const customerId = await findOrCreateCustomer(connection, req.user);
        const [addressResult] = await connection.query(
            `INSERT INTO customer_addresses
                (customer_id, receiver_name, receiver_phone, address_detail, is_default)
             VALUES (?, ?, ?, ?, 0)`,
            [customerId, receiverName, receiverPhone, address]
        );

        const orderItems = [];
        for (const item of items) {
            const table = item.type === "room" ? "homeai_room_products" : "products";
            const idColumn = item.type === "room" ? "id" : "product_id";
            const [rows] = await connection.query(
                `SELECT ${idColumn} AS id, product_name, price, stock_quantity, status
                 FROM ${table}
                 WHERE ${idColumn} = ?
                 FOR UPDATE`,
                [item.id]
            );
            const product = rows[0];

            if (!product || product.status !== "ACTIVE") {
                await connection.rollback();
                return res.status(409).json({
                    success: false,
                    message: "Một sản phẩm trong giỏ hàng không còn được bán."
                });
            }
            if (Number(product.stock_quantity) < item.quantity) {
                await connection.rollback();
                return res.status(409).json({
                    success: false,
                    message: `Sản phẩm "${product.product_name}" không đủ số lượng trong kho.`
                });
            }

            orderItems.push({
                ...item,
                product_name: product.product_name,
                unit_price: Number(product.price),
                subtotal: Number(product.price) * item.quantity
            });
        }

        const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        const orderCode = `HA-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        const [orderResult] = await connection.query(
            `INSERT INTO orders
                (customer_id, address_id, order_code, total_amount, shipping_fee,
                 discount_amount, final_amount, payment_method, payment_status,
                 order_status, note)
             VALUES (?, ?, ?, ?, 0, 0, ?, 'COD', 'UNPAID', 'PENDING', ?)`,
            [
                customerId,
                addressResult.insertId,
                orderCode,
                total,
                total,
                note || null
            ]
        );

        for (const item of orderItems) {
            await connection.query(
                `INSERT INTO order_items
                    (order_id, product_id, room_product_id, product_name,
                     quantity, unit_price, discount_amount, subtotal)
                 VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
                [
                    orderResult.insertId,
                    item.type === "product" ? item.id : null,
                    item.type === "room" ? item.id : null,
                    item.product_name,
                    item.quantity,
                    item.unit_price,
                    item.subtotal
                ]
            );

            const table = item.type === "room" ? "homeai_room_products" : "products";
            const idColumn = item.type === "room" ? "id" : "product_id";
            await connection.query(
                `UPDATE ${table}
                 SET status = IF(stock_quantity - ? <= 0, 'OUT_OF_STOCK', status),
                     stock_quantity = stock_quantity - ?
                 WHERE ${idColumn} = ?`,
                [item.quantity, item.quantity, item.id]
            );
        }

        await connection.query(
            `INSERT INTO payments
                (order_id, payment_code, amount, payment_method, payment_status, note)
             VALUES (?, ?, ?, 'COD', 'PENDING', 'Thanh toán khi nhận hàng')`,
            [
                orderResult.insertId,
                `${orderCode}-COD`,
                total
            ]
        );
        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Đặt hàng thành công. Bạn sẽ thanh toán khi nhận hàng.",
            data: {
                order_id: orderResult.insertId,
                order_code: orderCode,
                final_amount: total,
                payment_method: "COD",
                order_status: "PENDING"
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error("Lỗi tạo đơn hàng COD:", error);
        return res.status(500).json({
            success: false,
            message: "Không thể tạo đơn hàng lúc này. Vui lòng thử lại."
        });
    } finally {
        connection.release();
    }
});

module.exports = router;
