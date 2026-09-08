const express = require("express");

const app = express();

const PORT = 5000;

app.use(express.json());
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "HOMEAI Backend đang hoạt động!"
    });
});
app.get ("/api/home" , (req, res) => {
    res.json({
        success: true,
        message:"Chào mừng bạn đến với HOMEAI",
        project:"HOMEAI",
        description: "Website thương mại điện tử nội thất kết hợp AI"
    });
});
app.listen(PORT, () => {
    console.log(`HOMEAI Server đang chạy tại http://localhost:${PORT}`);
});