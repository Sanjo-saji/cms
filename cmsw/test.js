// seedPrincipal.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectdb from "../cmsw/config/connectiondb.js";
import Teacher from "../cmsw/model/teachers/teachers.model.js";

const seedPrincipal = async () => {
  try {
    connectdb();

    // 👀 check if a Principal already exists
    const existingPrincipal = await Teacher.findOne({ role: "Principal" });
    if (existingPrincipal) {
      console.log("✅ Principal already exists:", existingPrincipal.name);
      process.exit(0);
    }

    // 🔑 hash default password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // create a new Principal
    const principal = await Teacher.create({
      name: "System Principal",
      employee_id: "P-001",
      phone: "9999999999",
      dob: "1970-01-01",
      password: hashedPassword,
      passwordUpdate: false,
      address: {
        street: "Admin Street",
        city: "Headquarters",
        state: "HQ",
        pincode: "000000",
      },
      department: null,
      departmentHead: true,
      role: "Principal",
      classInCharge: null,
    });

    console.log("🎉 Principal seeded successfully:", principal.name);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Principal:", error.message);
    process.exit(1);
  }
};

seedPrincipal();
