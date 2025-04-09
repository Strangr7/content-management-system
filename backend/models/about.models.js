import mongoose, { model, Schema } from "mongoose";

const aboutSchema = new Schema(
  {
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const About = mongoose.model("About", aboutSchema);

export default About;
