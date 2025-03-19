const express = require("express");
const router = express.Router();
//import service
const {
    getAllUsers,
   changeUserStatus,
   changeOrderStatus,
   getOrderAdmin
} = require("../service/adminService");
const { userVerify, adminVerify } = require("../middlewares/authVerify");

//1. ดึงข้อมูลทั้งหมดไปแสดงที่หน้า admin
router.get("/admin/all-users", userVerify, adminVerify, getAllUsers);
router.get("/admin/orders", userVerify, adminVerify, getOrderAdmin);

//2. หลังดึงข้อมูลจะ update สถานะ
router.put("/admin/change-status", userVerify, adminVerify, changeUserStatus);
router.put("/admin/order-status", userVerify, adminVerify, changeOrderStatus);

module.exports = router;

/*router.post('/register', (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    
    res.send('register user');
})*/
