const fs = require("fs");
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const cloudinary = require("cloudinary").v2;

const errors = require("../errors");

const uploadProductImageLocal = async (req, res) => {
  console.log(req.files);
  if (!req.files) {
    throw new errors.BadRequestError("No file uploaded");
  }

  if (!req.files.image.mimetype.startsWith("image")) {
    throw new errors.BadRequestError("Please upload image.");
  }

  const maxFileSize = 5 * 1024 * 1024;

  if (req.files.image.size > maxFileSize) {
    throw new errors.BadRequestError(
      "Please upload image of size less than 5MB"
    );
  }

  const productImage = req.files.image;
  const productImagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );

  await productImage.mv(productImagePath);
  return res
    .status(StatusCodes.OK)
    .json({ image: { src: `/uploads/${productImage.name}` } });
};

const uploadProductImage = async (req, res) => {
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "file-upload",
    }
  );

  fs.unlinkSync(req.files.image.tempFilePath);

  return res.status(StatusCodes.OK).json({
    image: {
      src: `${result.secure_url}`,
    },
  });
};

module.exports = {
  uploadProductImage,
};
