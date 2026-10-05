const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "admin@sahyogsetu.com";
    const password = "Admin@12345";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Super Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: "System Admin",
      email,
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
    });

    console.log("Super Admin created successfully");
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("Error creating Super Admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();