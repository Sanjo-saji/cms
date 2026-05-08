import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["student", "teacher"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    // Legacy support for old message format
    s: String, // student message (legacy)
    t: String, // teacher message (legacy)
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to handle legacy message format
messageSchema.pre("save", function (next) {
  // If this is a legacy message (has 's' or 't' but no 'sender' or 'text')
  if ((this.s || this.t) && (!this.sender || !this.text)) {
    if (this.s) {
      this.sender = "student";
      this.text = this.s;
    } else if (this.t) {
      this.sender = "teacher";
      this.text = this.t;
    }
  }
  next();
});

const studentChatSchema = new mongoose.Schema({
  anonId: {
    type: String,
    required: true,
    // unique: true, // --- THIS LINE SHOULD BE REMOVED ---
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "students",
    required: true,
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    // Ensure this field exists
    type: Boolean,
    default: true,
  },
  deactivatedAt: {
    // Optional: to track when it was deactivated
    type: Date,
  },
});

const chatSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teachers",
      required: true,
    },
    students: [studentChatSchema],
  },
  { timestamps: true }
);

// Index for faster queries (removed duplicate)
chatSchema.index({ "students.studentId": 1 });

// Pre-save middleware to migrate legacy messages
chatSchema.pre("save", function (next) {
  if (this.students && this.students.length > 0) {
    this.students.forEach((student) => {
      if (student.messages && student.messages.length > 0) {
        student.messages.forEach((message) => {
          // Migrate legacy message format
          if ((message.s || message.t) && (!message.sender || !message.text)) {
            if (message.s) {
              message.sender = "student";
              message.text = message.s;
            } else if (message.t) {
              message.sender = "teacher";
              message.text = message.t;
            }
          }
        });
      }
    });
  }
  next();
});

// Pre-validate middleware to ensure all messages have required fields
chatSchema.pre("validate", function (next) {
  if (this.students && this.students.length > 0) {
    this.students.forEach((student) => {
      if (student.messages && student.messages.length > 0) {
        student.messages.forEach((message) => {
          // Ensure all messages have sender and text
          if (!message.sender || !message.text) {
            // Try to infer from legacy fields
            if (message.s) {
              message.sender = "student";
              message.text = message.s;
            } else if (message.t) {
              message.sender = "teacher";
              message.text = message.t;
            } else {
              // If no legacy fields, set defaults
              message.sender = "unknown";
              message.text = message.text || "Legacy message";
            }
          }
        });
      }
    });
  }
  next();
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
