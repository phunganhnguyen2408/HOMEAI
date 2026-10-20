const roomImageUrls = {
    "sofa-white.jpg": "/images/%E1%BA%A3nh%20pkhach/sofa-white.jpg.avif",
    "sofa-corner.jpg": "/images/%E1%BA%A3nh%20pkhach/sofa-corner.jpg.avif",
    "coffee-table.jpg": "/images/%E1%BA%A3nh%20pkhach/coffee-table.jpg.avif",
    "tv-console.jpg": "/images/%E1%BA%A3nh%20pkhach/tv-console.jpg.avif",
    "lounge-chair.jpg": "/images/%E1%BA%A3nh%20pkhach/lounge-chair.jpg.avif",
    "living-room-set.jpg": "/images/%E1%BA%A3nh%20pkhach/living-room-set.jpg.avif",
    "bed-white.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/bed-white.jpg.avif",
    "bed-wood.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/bed-wood.jpg.avif",
    "wardrobe.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/wardrobe.jpg.avif",
    "bedside-table.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/bedside-table.jpg.avif",
    "dressing-table.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/dressing-table.jpg.avif",
    "bedroom-lamp.jpg": "/images/ph%C3%B2ng%20ng%E1%BB%A7/bedroom-lamp.jpg.avif",
    "kitchen-cabinet.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/kitchen-cabinet.jpg.avif",
    "dining-table.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/dining-table.jpg.avif",
    "dining-chair.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/dining-chair.jpg.avif",
    "kitchen-island.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/kitchen-island.jpg.avif",
    "kitchen-shelf.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/kitchen-shelf.jpg.avif",
    "kitchen-cabinet-small.jpg": "/images/%E1%BA%A3nh%20b%E1%BA%BFp/kitchen-cabinet-small.jpg.avif",
};

export function getProductImageUrl(image) {
    if (!image || image.startsWith("http://") || image.startsWith("https://")) {
        return image || "";
    }

    const filename = image.replace(/^\/images\//, "");
    return roomImageUrls[filename] || `/images/${filename}`;
}
