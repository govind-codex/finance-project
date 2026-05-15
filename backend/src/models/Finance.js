const mongoose = require("mongoose");

const financeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    expense: {
      type: Number,
      required: true,
      min: 0,
    },
    goal: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      timeInMonths: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    goals: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        timeInMonths: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

financeSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("Finance", financeSchema);
