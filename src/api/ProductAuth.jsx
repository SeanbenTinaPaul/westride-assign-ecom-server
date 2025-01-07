//ติดต่อ backend

import axios from "axios";

export const createProduct = async (token, form) => {
   return await axios.post("http://localhost:5000/api/product", form, {
      headers: {
         Authorization: `Bearer ${token}`
      }
   });
};
//count = 20 → LIMIT = 20
export const listProduct = async (token, count = 20) => {
   return await axios.get("http://localhost:5000/api/products/"+count, {
      headers: {
         Authorization: `Bearer ${token}`
      }
   });
};
