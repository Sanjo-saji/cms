import connectdb from "../config/connectiondb.js";
import mongoose from "mongoose";

async function testDatabaseConnection() {
  try {
    console.log("🔌 Testing database connection...");

    // Connect to database
    await connectdb();
    console.log("✅ Database connected successfully");

    // Test if we can access collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📚 Available collections:",
      collections.map((c) => c.name)
    );

    // Test if AnonymousId collection exists
    const anonIdExists = collections.some((c) => c.name === "anonymousids");
    console.log("🆔 AnonymousId collection exists:", anonIdExists);

    // Test if Chat collection exists
    const chatExists = collections.some((c) => c.name === "chats");
    console.log("💬 Chat collection exists:", chatExists);

    // Test if Student collection exists
    const studentExists = collections.some((c) => c.name === "students");
    console.log("👨‍🎓 Student collection exists:", studentExists);

    // Test if Teacher collection exists
    const teacherExists = collections.some((c) => c.name === "teachers");
    console.log("👨‍🏫 Teacher collection exists:", teacherExists);

    // Test model imports
    try {
      const { default: AnonymousId } = await import(
        "../model/anonymous/anonymous.model.js"
      );
      console.log("✅ AnonymousId model imported successfully");

      const { default: Chat } = await import("../model/chat/chat.model.js");
      console.log("✅ Chat model imported successfully");

      const { default: Student } = await import(
        "../model/student/student.model.js"
      );
      console.log("✅ Student model imported successfully");

      const { default: Teacher } = await import(
        "../model/teachers/teachers.model.js"
      );
      console.log("✅ Teacher model imported successfully");
    } catch (importError) {
      console.error("❌ Model import error:", importError.message);
    }

    console.log("\n🎯 Database test completed!");
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    console.error("Error stack:", error.stack);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the test
testDatabaseConnection().catch(console.error);
