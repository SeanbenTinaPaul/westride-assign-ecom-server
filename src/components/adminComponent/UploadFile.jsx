//parent→ FormProduct.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Resizer from "react-image-file-resizer";

import { uploadFiles } from "../../api/ProductAuth";

import useEcomStore from "../../store/ecom-store";

const UploadFile = ({ inputForm, setInputForm }) => {
    const token = useEcomStore((state) => state.token);
   const [isLoading, setIsLoading] = useState(false);
   const handleOnChange = (e) => {
      const files = e.target.files;
      if (files) {
         setIsLoading(true);
         let allFiles = inputForm.images; //images → array
         for (let i = 0; i < files.length; i++) {
            console.log(files[i]);
            //validate not image
            if (!files[i].type.startsWith("image/")) {
               toast.error(`${files[i].name} is not image file`);
               continue;
            }
            //Image Resize
            Resizer.imageFileResizer(
                files[i],
                720,
                720,
                "JPEG",
                100,
                0,
                (data) => {
                    //Endpoint backend
                    uploadFiles(token, data)
                    .then((res)=>{
                        console.log(res);
                    })
                    .catch((err)=>{
                        console.log(err);
                    })
                },
                "base64"
            )
         }
      }
   };
   return (
      <div>
         <input
            type='file'
            name='images'
            multiple //ให้สามารถเลือกไฟล์มากกว่า 1
            className='form-control'
            onChange={handleOnChange}
         />
      </div>
   );
};

UploadFile.propTypes = {
   inputForm: PropTypes.object,
   setInputForm: PropTypes.func
};

export default UploadFile;
