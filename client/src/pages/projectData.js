
export const projectList = [
  {
    id: 1,
    name: "Không gian sống thanh lịch",
    room: "Phòng khách",
    style: "Hiện đại",
    area: 35,
    budget: 85000000,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
    description:
      "Không gian mở, ánh sáng tự nhiên và nội thất tinh giản.",
  },
  {
    id: 2,
    name: "Phòng ngủ thư giãn",
    room: "Phòng ngủ",
    style: "Tối giản",
    area: 22,
    budget: 45000000,
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
    description:
      "Tông màu nhẹ nhàng, tạo cảm giác thư thái mỗi ngày.",
  },
  {
    id: 3,
    name: "Bếp ấm cúng cho gia đình",
    room: "Phòng bếp",
    style: "Scandinavian",
    area: 28,
    budget: 65000000,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
    description:
      "Chất liệu gỗ ấm áp kết hợp bố cục tiện nghi.",
  },
  {
    id: 4,
    name: "Căn hộ hiện đại",
    room: "Phòng khách",
    style: "Hiện đại",
    area: 45,
    budget: 120000000,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    description:
      "Thiết kế tinh tế, tối ưu công năng cho căn hộ.",
  },
  {
    id: 5,
    name: "Phòng ngủ phong cách Bắc Âu",
    room: "Phòng ngủ",
    style: "Scandinavian",
    area: 25,
    budget: 55000000,
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85",
    description:
      "Màu trung tính, vật liệu tự nhiên và đường nét đơn giản.",
  },
  {
    id: 6,
    name: "Bếp tối giản sang trọng",
    room: "Phòng bếp",
    style: "Tối giản",
    area: 30,
    budget: 75000000,
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
    description:
      "Tập trung vào sự gọn gàng và tiện lợi khi sử dụng.",
  },
];

export const categories = [
  "Tất cả",
  "Phòng khách",
  "Phòng ngủ",
  "Phòng bếp",
];

export function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price) + " đ";
}
