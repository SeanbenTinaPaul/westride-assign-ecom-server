import React, { useState, useEffect } from "react";
import useEcomStore from "../../store/ecom-store";
import { createProduct } from "../../api/ProductAuth";
import { toast } from "react-toastify";

const inputProd = {
   title: "",
   description: "",
   price: "",
   quantity: "",
   categoryId: "",
   images: []
};

const FormProduct = () => {
   // const token = useEcomStore((state)=> state.token)
   // const getCategory = useEcomStore((state)=> state.getCategory)
   // const categories = useEcomStore((state)=> state.categories)
   const { token, getCategory, categories } = useEcomStore((state) => state);
   const [inputForm, setInputForm] = useState(inputProd);

   useEffect(() => {
      getCategory(token);
   }, []);
   const handleOnchange = (e) => {
      console.log(e.target.name, e.target.value);
      setInputForm({
         ...inputForm,
         [e.target.name]: e.target.value
      });
   };
   const handleSubmit = async (e) => {
      e.preventDefault();
      console.log(inputForm);

      /* 
        const titleInput = document.querySelector('[name="title"]').value;
        const priceInput = document.querySelector('[name="price"]').value;
        const quantityInput = document.querySelector('[name="quantity"]').value;
        const catIdSelect = document.querySelector('[name="categoryId"]').value;
        const titleInput = inputForm.title;
        const priceInput = inputForm.price;
        const quantityInput = inputForm.quantity;
        const catIdSelect = inputForm.categoryId;
        if (!catIdSelect || catIdSelect === "0") return toast.warning("Please select category.");
        if (!titleInput || !priceInput || !quantityInput)
           return toast.warning("Please enter all fields.");
      */

      //if user did not select category and click 'Add Product' ► won't let to submit, using return to stop
      for (let key in inputForm) {
         if (!inputForm[key] || inputForm[key] === "" || inputForm[key] === "0") {
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
         console.log(res);
      } catch (err) {
         console.log(err);
      }
      //   setInputForm({
      //     title: "",
      //     description: "",
      //     price: "",
      //     quantity: "",
      //     categoryId: "",
      //     images: []
      //   })
   };
   return (
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
               name='title'//โผล่ใน event.target.name
               value={inputForm.title}////โผล่ใน event.target.value
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
               id=''
               className='border my-1'
               onChange={handleOnchange}
               required
            >
               <option value={0}>Select category</option>
               {categories.map((item, i) => (
                  <option
                     key={i}
                     value={item.id}
                  >
                     {item.name}
                  </option>
               ))}
            </select>
            <button className='bg-fuchsia-800 hover:bg-fuchsia-700 text-white font-bold py-2 px-4 rounded shadow-md'>
               Add Product
            </button>
         </form>
      </div>
   );
};

export default FormProduct;
