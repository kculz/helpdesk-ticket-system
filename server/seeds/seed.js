require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedAdmin = async () => {
  try {
    const adminEmail = "admin123@admin.com";
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log("Admin user already exists.");
    } else {
      adminUser = new User({
        workId: "ADMIN001",           // Ensure this is unique across your users
        fullname: "Administrator",
        phone: "1234567890",
        email: adminEmail,
        dept: "Administration",
        role: "admin",
      });
      await adminUser.save();
      console.log("Admin user created successfully.");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();
