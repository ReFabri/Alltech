import * as dotenv from "dotenv";
import mongoose from "mongoose";
import colors from "colors";
import products from "./data/phonesData.js";
import Product from "./models/productModel.js";
import users from "./data/users.js";
import User from "./models/userModel.js";
import Order from "./models/orderModel.js";
import connectDB from "./config/db.js";
dotenv.config();

import cloudinaryModule from "cloudinary";
const cloudinary = cloudinaryModule.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

mongoose.set("strictQuery", false);
connectDB();

console.log(
  `To destroy all DB data call this script with the "-d" argument`.yellow
);
console.log(
  `or use `.yellow,
  `"npm run data:import"`.green,
  `or`.yellow,
  `"npm run data:destroy"`.red
);

async function uploadImageToCloudinary(imageUrl) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "AllTech",
    });
    return result.secure_url;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);

    const adminUser = createdUsers[0]._id;

    const sampleProducts = await Promise.all(
      products.map(async (product) => {
        const cloudinaryUrl = await uploadImageToCloudinary(product.image);

        const pd = {
          brand: product["description"]["Brand"],
          model: product["description"]["Model Name"],
          carrier: product["description"]["Wireless Carrier"],
          os: product["description"]["Operating System" || "OS"],
          celTech: product["description"]["Cellular Technology"],
          storage: product["description"]["Memory Storage Capacity"],
          connectivity: product["description"]["Connectivity Technology"],
          color: product["description"]["Color"],
          screen: product["description"]["Screen Size"],
          wireless: product["description"]["Wireless network technology"],
        };

        const txt = {
          model: `The ${pd.model} is the best that ${pd.brand} has to offer. `,
          carrier: "It's unlocked for all carriers. ",
          os: pd.os
            ? `The operating system is ${pd.os}. `
            : "The operating system is Android. ",
          celTech: "It's 5G enabled for maximum speed. ",
          storage: pd.storage
            ? `It's memory storage capacity is ${pd.storage}. `
            : "",
          connectivity: pd.connectivity ? `${pd.connectivity} available. ` : "",
          screen: pd.screen ? `The screen size is ${pd.screen}. ` : "",
          wireless: pd.wireless ? `${pd.wireless} technology. ` : "",
        };

        const description =
          txt.model +
          txt.carrier +
          txt.os +
          txt.celTech +
          txt.storage +
          txt.connectivity +
          txt.screen +
          txt.wireless;

        return {
          user: adminUser,
          name: product.name,
          image: cloudinaryUrl,
          description: description.trim(),
          brand: product.brand,
          category: product.category,
          price: Number(product.price),
          countInStock: Number(product.countInStock),
          rating: 0,
          numReviews: 0,
        };
      })
    );

    await Product.insertMany(sampleProducts);

    console.log("Data imported to DB.".green.inverse);
    process.exit();
  } catch (error) {
    console.log(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Data REMOVED from DB.".red.inverse);
    process.exit();
  } catch (error) {
    console.log(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
