const prisma = require("../config/prisma");


//Feature/Button: "View All Users", "User Management", "Admin: View Users"
exports.listUsers = async (req, res) => {
   try {
      const users = await prisma.user.findMany({
         select: {
            id: true,
            email: true,
            role: true,
            enabled: true,
            address: true
         }
      });

      res.status(200).json({
         success: true,
         message: "Get to All User Success",
         data: users
      });
   } catch (err) {
      console.log(err);
      res.status(500).json({
         success: false,
         message: "Error!!! Cannot get all user."
      });
   }
};

//Feature/Button: "Enable/Disable User", "Change User Status", "Admin: Update User Status"
exports.changeStatus = async (req, res) => {
   try {
      const { id, enabled } = req.body;
      const user = await prisma.user.update({
         where: { id: Number(id) },
         data: { enabled: enabled }
      });

      res.status(200).json({
         success: true,
         message: `Update userID: ${id} status to ${enabled}.`
      });
   } catch (err) {
      console.log(err);
      res.status(500).json({
         success: false,
         message: "Error!!! Cannot change status."
      });
   }
};

//Feature/Button: "Change User Role", "Update User Role", "Admin: Change Role"
exports.changeRole = async (req, res) => {
   try {
      const { id, role } = req.body;
      const user = await prisma.user.update({
         where: { id: Number(id) },
         data: { role: role }
      });

      res.status(200).json({
         success: true,
         message: `Update userID: ${id} role to ${role}.`
      });
   } catch (err) {
      console.log(err);
      res.status(500).json({
         success: false,
         message: "Error!!! Cannot change role."
      });
   }
};

//ข้อมูลการสั่งซื้อในตะกร้าของ users
//Feature/Button: "Add to Cart", "Update Cart", "Save Cart"
exports.userCart = async (req, res) => {
   try {
      const { cart } = req.body;
      //1. check ว่า user มีข้อมมูลอยู่ในตาราง User หรือไม่
      const user = await prisma.user.findFirst({
         where: { id: Number(req.user.id) }
      });

      //2. Delete old cart to INSERT new cart
      //table'ProductOnCart' เป็นตารางกลางระหว่าง 'Product' กับ 'Cart'
      /*
          DELETE FROM "ProductOnCart"
              WHERE "cartId" IN (
              SELECT "id" FROM "Cart" 
              WHERE "orderedById" = user.id
              );
          */
      await prisma.productOnCart.deleteMany({
         where: {
            //cart หมายถึง เอา productOnCart.cartId ซึ่งเท่ากับ Cart.id เมื่อพบว่า Cart.orderedById เท่ากับ user.id
            cart: { orderedById: user.id }
         }
      });
      await prisma.cart.deleteMany({
         where: {
            orderedById: user.id
         }
      });

      //3. เตรียมสินค้าใหม่สำหรับ insert ลงในตาราง Cart
      //req.body.cart ===[{},{},...]
      let products = cart.map((item) => ({
         productId: item.id,
         count: item.count,
         price: item.price
      }));

      //4. หาราคารวมของสินค้าในตะกร้า
      let cartTotal = products.reduce((sum, item) => {
         return sum + item.price * item.count;
      }, 0);

      //5. Insert ข้อมูลลงในตาราง Cart
      //data: === INSERT INTO Cart (products, cartTotal, orderById) VALUES (products, cartTotal, orderById)
      const newCart = await prisma.cart.create({
         data: {
            products: {
               create: products
            },
            cartTotal: cartTotal,
            orderedById: user.id
         }
      });
      res.status(200).json({
         success: true,
         message: "Add product to cart success",
         ProductOnCart: products,
         Cart: newCart
      });
   } catch (err) {
      console.log(err);
      res.status(500).json({
         success: false,
         message: "Error!!! Cannot add product to cart."
      });
   }
};


//Feature/Button: "View Cart", "My Cart", "Cart Details"
exports.getUserCart = async (req, res) => {
   try {
      //0. ลองไม่ check user ว่ามีในตาราง User หรือไม่ ก่อน
      //1. หา cart ของ user นั้น
      const cart = await prisma.cart.findFirst({
         where: {
            orderedById: Number(req.user.id)
         },
         // include === JOIN
         include: {
            products: {
               include: {
                  product: true
               }
            }
         }
      });

      res.status(200).json({
         success: true,
         message: "This is your cart.",
         Products: cart.products,
         "Total price": cart.cartTotal
      });
   } catch (err) {
      console.log(err);
      res.status(500).json({
         success: false,
         message: "Error!!! Cannot get product in cart."
      });
   }
};

//Feature/Button: "Empty Cart", "Clear Cart", "Remove All Items from Cart"
exports.emptyCart = async (req, res) => {
   try {
      //1. หา cart ของ user นั้นว่ามีหรือไม่
      const cart = await prisma.cart.findFirst({
         where: { orderedById: Number(req.user.id) }
      });
      //2. ถ้าไม่มีให้ return 400
      if (!cart) return res.status(400).json({ message: "No cart found." });
      //3. ถ้ามีให้ลบข้อมูลในตาราง ProductOnCart และ Cart ทั้งหมด
      await prisma.productOnCart.deleteMany({
         where: { cartId: cart.id }
      });
      const delCart = await prisma.cart.deleteMany({
         where: { orderedById: Number(req.user.id) }
      });

      res.status(200).json({
         success: true,
         message: "Success!!! Your cart is now empty.",
         "deleted count": delCart.count,
         "deleted cart": delCart, //{"count": 1}
         data: cart
      });
   } catch (err) {
      console.log(err);
      res.status(500).json({
         success: false,
         message: "Error!!! Cannot empty a cart."
      });
   }
};


//Feature/Button: "Save Address", "Update Address", "Add/Edit Address"
exports.saveAddress = async (req, res) => {
   try {
      const { address } = req.body;
      const addressUser = await prisma.user.update({
         where: { id: Number(req.user.id) },
         data: { address: address }
      });
      res.status(200).json({
         success: true,
         message: "Update Address Success",
         address: addressUser.address,
         profile: addressUser
      });
   } catch (err) {
      console.log(err);
      res.status(500).json({
         success: false,
         message: "Error!!! Cannot update address."
      });
   }
};

/*เท่ากับ
where: {
    orderedBy : {
        id: Number(req.user.id)
    }
}
*/
//Feature/Button: "Place Order", "Checkout", "Confirm Order"
exports.saveOrder = async (req, res) => {
    try {
       //1. หา cart ของ user นั้นว่ามีหรือไม่
       //products    ProductOnCart[]
       // userCart จะดึง record แรก ทุกคอลัมน์จาก table 'Cart' orderedById เท่ากับ req.user.id และบางส่วนจาก 'ProductOnCart' ที่มี orderedById เท่ากับ req.user.id
       const userCart = await prisma.cart.findFirst({
          where: {
             orderedById: Number(req.user.id)
          },
          include: {
             products: {
                select: {
                   cartId: true,
                   productId: true,
                   count: true,
                   price: true
                }
             }
          }
       });
 
       //2. ถ้าไม่มีให้ return 400
       if (!userCart || userCart.products.length === 0)
          return res
             .status(400)
             .json({ message: "Your cart is empty. Please add some product to a cart." });
 
       //3. Compare: product quantity in cart (userCart.products) vs  product quantity in stock (product.quantity)
       let outStockProd = []; //เก็บ product ที่ไม่มี stock พอ
       for (const item of userCart.products) {
          const product = await prisma.product.findUnique({
             where: { id: item.productId },
             select: { quantity: true, title: true }
          });
          /*
          item   { cartId: 15, productId: 5, count: 2, price: 40000 }
          product{ quantity: 1000, title: 'Core i9-11800K' }
          item   { cartId: 15, productId: 7, count: 10, price: 250 }
          product{ quantity: 10, title: 'ขาหมูเยอรมัน' }
          */
          if (!product || item.count > product.quantity) {
             outStockProd.push(product?.title || "product");
          }
       }
       //4. if outStockProd.length > 0, return 400
       if (outStockProd.length > 0) {
          return res
             .status(400)
             .json({ message: `Sorry. Product: ${outStockProd.join()} out of stock.` });
       }
 
       //5. create new Order
       //products    ProductOnOrder[]
       const order = await prisma.order.create({
          data: {
             products: {
                create: userCart.products.map((item) => ({
                   productId: item.productId,
                   count: item.count,
                   price: item.price
                }))
             },
             //connect คือ create record: orderedById ในตาราง Order(ว่าง) ตาม User.id(มีอยู่แล้ว) 
             /*
             INSERT INTO "Order" (orderedById, ...)
             VALUES ((SELECT id FROM "User" WHERE id = req.user.id), ...);
             */
             orderedBy: {
                connect: {
                   id: Number(req.user.id)//=== id: userCart.orderedById
                }
             },
             cartTotal: userCart.cartTotal // Ensure cartTotal is included here
          }
       });

       //6. ลบข้อมูลในตาราง ProductOnCart และ Cart ทั้งหมด
       /*
       กระบวนการ:
       - ถ้า create ในตาราง Order แล้วก็ต้องลบในตาราง Cart และ ProductOnCart
       - ในตาราง Product ต้องลบจำนวนสินค้าที่สั่งออกไปจาก stock
       */
       //6.1 เตรียมข้อมูลสำหรับ update จำนวนสินค้าในตาราง Product.sold และ Product.quantity
       const updateProduct = userCart.products.map((item) => ({
         where: { id:item.productId },
         data: {
            sold: {increment: item.count},
            quantity: {decrement: item.count}
         }
       }))
       //6.2 ส่ง updateProduct ไป update ในตาราง Product
       //The key is to collect the promises in an array and then use Promise.all() to wait for all the promises to resolve.
       // await Promise.all([promise1, promise2, ...]) | when promise = {..}
       await Promise.all(
         updateProduct.map((promise) => prisma.product.update(promise))
       )

       //6.3 ลบข้อมูลในตาราง ProductOnCart และ Cart ทั้งหมด
       // ติด onDelete: Cascade ในตาราง ProductOnCart.cartId ไว้ → ถ้าลบ record ในตาราง Cart จะลบ record ในตาราง ProductOnCart ด้วย
       await prisma.cart.deleteMany({
         where: { orderedById: Number(req.user.id) }
       })

       res.status(200).json({
          success: true,
          message: "save Order Success",
          data: userCart,
          updateProduct: updateProduct,
          order: order
       });
       //7. records ในตาราง Order และ ProductOnOrder จะไม่ถูกลบ → ใช้เก็บ log การสั่งซื้อทั้งหมดของ users 
    } catch (err) {
       console.log(err);
       res.status(500).json({
          success: false,
          message: "Error!!! Cannot save order."
       });
    }
 };

//ข้อมูลประวัติการสั่งซื้อของ users 
/*
Order.products    ProductOnOrder[]
ProductOnOrder.product   Product
*/
//Feature/Button: "View Orders", "Order History", "My Orders"
exports.getOrder = async (req, res) => {
   try {
      const orders = await prisma.order.findMany({
         where: { orderedById: Number(req.user.id) },
         include: { 
            products: {
               include: { product: true }
            } 
         }
      })

      if(orders.length === 0) 
         return res.status(400).json({ success: false, message: "No order found." });

      res.status(200).json({
         success: true,
         message: "This is your history order.",
         data: orders
      });
   } catch (err) {
      console.log(err);
      res.status(500).json({
         success: false,
         message: "Get to getOrder Error",
         error: err.message
      });
   }
};
