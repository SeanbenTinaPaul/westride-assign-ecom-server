//parent→ FormProduct.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Resizer from "react-image-file-resizer";

import { uploadFiles } from "../../api/ProductAuth";

import useEcomStore from "../../store/ecom-store";

import ColorThief from "colorthief";//use for making text color auto-contrast

const UploadFile = ({ inputForm, setInputForm }) => {
   const token = useEcomStore((state) => state.token);
   const [isLoading, setIsLoading] = useState(false);
   const [textColors, setTextColors] = useState({}); // Store text color for each image
   const handleOnChange = (e) => {
      console.log("inputForm after img upload->", inputForm);
      const fileList = e.target.files;
      /*fileList === {
                        "0": { lastModified : 1736416405065,
	                            lastModifiedDate : Thu Jan 09 2025 16:53:25 GMT+0700 (Indochina Time),
	                            name : "1000269976_front_XXL.jpg",
	                            size : 29754,
	                            type : "image/jpeg",
	                            webkitRelativePath : ""
                              },
                        "1": {...}
                     }
      */
      //after user click 'select' for images → files === true
      if (fileList) {
         setIsLoading(true);
         // imgDataArr used to save image-data obj
         let imgDataArr = inputForm.images; //images → empty array
         for (let i = 0; i < fileList.length; i++) {
            console.log(fileList[i]);
            //validate if it is image → type: "image/jpeg" , "image/png"
            if (!fileList[i].type.startsWith("image/")) {
               toast.error(`${fileList[i].name} is not image file`);
               continue; //skip Resizer.imageFileResizer()
            }
            //Image Resize
            Resizer.imageFileResizer(
               fileList[i],
               720,
               720,
               "JPEG",
               100,
               0,
               (binaryImg) => {
                  // data === base64 of image
                  //ProductAuth.jsx → backend
                  uploadFiles(token, binaryImg)
                     .then((res) => {
                        // console.log(res);
                        /* 
                        res === {success: true,
                                 message: "Upload success",
                                 data: {asset_id:"4a1b",...}
                                 } 
                        */
                        imgDataArr.push(res.data);
                        setInputForm({
                           ...inputForm,
                           images: imgDataArr
                        });
                        toast.success(`Upload image success!!!`);
                     })
                     .catch((err) => {
                        console.log(err);
                     });
               },
               "base64" //encode img to base64 binary
            );
         }
      }
   };

   const calculateTextColor = (imgElement, assetId) => {
      const colorThief = new ColorThief();
      const [r, g, b] = colorThief.getColor(imgElement);
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b; // Calculate luminance
      const contrastColor = luminance > 128 ? "black" : "white"; // Choose contrast color
      setTextColors((prev) => ({ ...prev, [assetId]: contrastColor }));
   };

   return (
      <div>
         <div className='flex flex-wrap gap-1 justify-start mx-2 my-3'>
            {/*access url -> inputForm.images[i].data.url */}
            {inputForm.images &&
               inputForm.images.map((obj) => {
                  return (
                     <div
                        key={obj.data.asset_id}
                        className='relative'
                     >
                        <img
                           src={obj.data.url}
                           alt='product-img'
                           className='uploadImg h-24 relative'
                           crossOrigin='anonymous' // Needed for Color Thief
                           onLoad={(e) => calculateTextColor(e.target, obj.data.asset_id)}
                        />
                        <span
                           className={`absolute top-0 right-1 font-bold cursor-pointer`}
                           style={{ color: textColors[obj.data.asset_id] || "black" }}
                        >
                           x
                        </span>
                     </div>
                  );
               })}
         </div>
         <div>
            <input
               type='file'
               name='images'
               multiple //ให้สามารถเลือกไฟล์มากกว่า 1
               className='form-control'
               onChange={handleOnChange}
            />
         </div>
      </div>
   );
};

UploadFile.propTypes = {
   inputForm: PropTypes.object,
   setInputForm: PropTypes.func,
   dominantColor: PropTypes.any
};

export default UploadFile;
