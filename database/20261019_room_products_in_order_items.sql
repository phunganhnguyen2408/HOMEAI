ALTER TABLE order_items
    MODIFY COLUMN product_id INT(11) NULL,
    ADD COLUMN room_product_id INT(11) NULL AFTER product_id,
    ADD CONSTRAINT fk_order_items_room_product
        FOREIGN KEY (room_product_id) REFERENCES homeai_room_products (id);
