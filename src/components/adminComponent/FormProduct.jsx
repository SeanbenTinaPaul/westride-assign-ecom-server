import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

//Global state
import useEcomStore from "../../store/ecom-store";
//API
import { createProduct } from "../../api/ProductAuth";
//Component
import TableListProducts from "./TableListProducts";
import UploadFile from "./UploadFile";

const inputProd = {
   title: "",
   description: "",
   price: "",
   quantity: "",
   categoryId: "",
   images: [] //save url of images from Cloudinary
};

function FormProduct() {
   // const token = useEcomStore((state)=> state.token)
   // const getCategory = useEcomStore((state)=> state.getCategory)
   // const categories = useEcomStore((state)=> state.categories)
   const { token, getCategory, categories, getProduct, products } = useEcomStore((state) => state);
   const [inputForm, setInputForm] = useState(inputProd);
   // console.log('categories->',categories)
   // console.log(products);

   //separate to avoid calling unnessary fn in useEffect()
   /*
   useEffect(() => {
      async function getCategoryData() {
         const result = await getCategory(token);
         console.log('category->', result);
      }
      getCategoryData();
   }, [token, getCategory]);
   */
   useEffect(() => {
      getCategory(token).then((result) => {
         console.log("category->", result);
      });
   }, [token, getCategory]);

   useEffect(() => {
      getProduct(token, 10);
   }, [token, getProduct]);

   const handleOnchange = (e) => {
      console.log(e.target.name, e.target.value);
      setInputForm({
         ...inputForm,
         [e.target.name]: e.target.value
      });
   };
   const handleSubmit = async (e) => {
      e.preventDefault();
      console.log("inputForm->", inputForm);

      /* 
        const titleInput = inputForm.title;
        const priceInput = inputForm.price;
        const quantityInput = inputForm.quantity;
        const catIdSelect = inputForm.categoryId;
        if (!catIdSelect || catIdSelect === "") return toast.warning("Please select category.");
        if (!titleInput || !priceInput || !quantityInput)
           return toast.warning("Please enter all fields.");
      */

      //if user did not select category and click 'Add Product' ► won't let to submit, using return to stop
      for (let key in inputForm) {
         if (!inputForm[key] || inputForm[key] === "") {
            if (key === "description") continue; //empty description can be allowed
            if (key === "categoryId") {
               return toast.warning("Please select category.");
            } else {
               return toast.warning("Please enter all fields.");
            }
         }
      }

      try {
         const res = await createProduct(token, inputForm);
         console.log("res->", res);
         toast.success(`Add Product: ${res.data.title} Success.`);
         //refresh the list after click 'Add Product'
         setInputForm({
            title: "",
            description: "",
            price: "",
            quantity: "",
            categoryId: "",
            images: []
         });
      } catch (err) {
         console.log(err);
      }
   };

   return (
      <div>
         <div className='container mx-auto p-4 gap-4 bg-Dropdown-option-night shadow-md rounded-md'>
            <form
               action=''
               // onSubmit ต้องไว้ที่ <form> เพื่อให้เรียก handleSubmit() ถ้าจะไว้ตรง <btn> ให้ใช้ onClick
               onSubmit={handleSubmit}
            >
               <h1>Product Management</h1>
               <input
                  type='text'
                  className='border my-1'
                  name='title' //โผล่ใน event.target.name
                  value={inputForm.title} ////โผล่ใน event.target.value
                  placeholder='Product Name'
                  onChange={handleOnchange}
               />
               <input
                  type='text'
                  className='border my-1'
                  name='description'
                  value={inputForm.description}
                  placeholder='Description'
                  onChange={handleOnchange}
               />
               <input
                  type='number'
                  step='0.01' //ให้เติมทศนิยมได้ 2 ตัว |='any'ได้ทุกตัว
                  className='border my-1'
                  name='price'
                  value={inputForm.price}
                  placeholder='Price'
                  onChange={handleOnchange}
               />
               <input
                  type='number'
                  className='border my-1'
                  name='quantity'
                  value={inputForm.quantity}
                  placeholder='Quantity'
                  onChange={handleOnchange}
               />
               <select
                  name='categoryId'
                  value={inputForm.categoryId}
                  id=''
                  className='border my-1'
                  onChange={handleOnchange}
                  required
               >
                  <option
                     value={""}
                     disabled
                  >
                     Select category
                  </option>
                  {categories.map((item, i) => (
                     <option
                        key={i}
                        value={item.id}
                     >
                        {item.name}
                     </option>
                  ))}
               </select>
               {/* upload img file */}
               <UploadFile inputForm={inputForm} setInputForm={setInputForm} />
               <button className='bg-fuchsia-800 hover:bg-fuchsia-700 text-white font-bold py-2 px-4 rounded shadow-md'>
                  Add Product
               </button>
            </form>
         </div>
            {/* table of all products */}
         <div className='mt-4'>
            <TableListProducts products={products} />
         </div>
      </div>
   );
}

export default FormProduct;
