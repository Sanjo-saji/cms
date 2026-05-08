import mongoose from "mongoose";

const anonymousIdSchema = new mongoose.Schema({
  anonId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "students",
    required: true,
    index: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teachers",
    required: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  hash: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

// Compound index for efficient queries
anonymousIdSchema.index({ studentId: 1, teacherId: 1 });
anonymousIdSchema.index({ anonId: 1, isActive: 1 });

// Method to update usage statistics
anonymousIdSchema.methods.updateUsage = function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return this.save();
};

// Method to deactivate anonId
anonymousIdSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Static method to find active anonId for student-teacher pair
anonymousIdSchema.statics.findActiveAnonId = function(studentId, teacherId) {
  return this.findOne({
    studentId,
    teacherId,
    isActive: true
  });
};

// Static method to regenerate anonId for student-teacher pair
anonymousIdSchema.statics.regenerateAnonId = async function(studentId, teacherId, newAnonId, newHash) {
  // Deactivate old anonId
  await this.updateMany(
    { studentId, teacherId, isActive: true },
    { isActive: false }
  );

  // Create new anonId
  return this.create({
    anonId: newAnonId,
    studentId,
    teacherId,
    hash: newHash,
    isActive: true
  });
};

const AnonymousId = mongoose.model("AnonymousId", anonymousIdSchema);

export default AnonymousId;
