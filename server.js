// 1. import expres
const express = require("express");
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs"); //ใช้ในการอ่านทุกๆไฟล์ใน 1 โฟลเดอร์v
const cors = require("cors"); //อนุญาตให้ server และ client ติดต่อกันได้ผ่าน domain name
const helmet = require("helmet"); //ป้องกัน man-in-the-middle attack โดยการดักจับ req และ res ในรูปแบบ HTTP Header
const { rateLimit } = require("express-rate-limit"); //limit request
// const authRouter = require('./routes/auth.js');

//middleware
app.use(morgan("common"));
app.use(express.json({ limit: "20mb" }));
app.use(cors());
app.use(helmet()); //ไว้ล่างของ const app = express();
app.set('trust proxy', 'loopback, linklocal, uniquelocal'); //trust proxy to avoid issue with express-rate-limit

const port = process.env.PORT || 3000;

const limiter = rateLimit({
   windowMs: 1 * 60 * 1000, // 1 minutes และจะรีเซ็ตโควต้าให้อัตโนมัติทุกๆ 1 นาที
   limit: 1000, // Limit each IP to 100 requests per `window` (reset after 1 minutes).
   standardHeaders: "draft-7", //'draft-7'หากต้องการใช้ header มาตรฐานล่าสุด.
   legacyHeaders: false, // เปลียนเป็น true หากต้องการใช้ header ที่เก่า
   handler: (req, res) => {
      res.status(429).json({
         status: "Fail",
         message: "Too many requests from this IP. Please, try again after a minute."
      });
   }
});

//Routers
readdirSync("./routes").map((r) => {
   const router = require(`./routes/${r}`);
   return app.use("/api", limiter, router);
});


// catch all route to handle unknown req | match any req method (GET, POST, PUT, DELETE, etc.)
app.all("*", (req, res) => {
   res.status(404).json({ message: "URL not found" });
});

// 2. start server
app.listen(port, () => {
   console.log("Server is running on port..", port);
});
// module.exports = app;