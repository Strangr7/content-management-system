import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import About from "../models/about.models.js";
import logger from "../utils/logger.js";
//add description
const addDescriptin = asyncHandler(async (req, res) => {
  const { description } = req.body;

  if (!description) throw new APIError(400, "All fields are required");
  try {
    const newDescription = new About({ description });
    await newDescription.save();
    logger.info("Description uploaded successfully,", { description });
    return res
      .status(201)
      .json(
        new APIResponse(201, newDescription, "Description uploaded succesfully")
      );
  } catch (error) {
    logger.error("desription upload failed", { error: error.message });
    throw new APIError(500, "Description upload failed");
  }
});

//get description

const getDescription = asyncHandler(async (req, res) => {
  const description = await About.find();


  if(description === null){
    return res.status(200).json(new APIResponse(400, [], "No description found"));
  }
  res
    .status(200)
    .json(new APIResponse(201, description, "Description fetched successfully"));

});

export { addDescriptin,getDescription };
