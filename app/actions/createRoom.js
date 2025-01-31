"use server";

import { createAdminClient } from "@/config/appwrite";
import checkAuth from "./checkAuth";
import { ID } from "node-appwrite";
import { revalidatePath } from "next/cache";

async function createRoom(previousState, formData) {
  const { databases, storage } = await createAdminClient();
  try {
    const { user } = await checkAuth();
    if (!user) {
      return { error: "You must be logged in to create a room" };
    }

    let imageID;
    const image = formData.get("image");

    if (image && image.size > 0 && image.name !== undefined) {
      try {
        const response = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
          ID.unique(),
          image
        );
        imageID = response.$id;
      } catch (error) {
        console.log("Error upolading image", error);
        return {
          error: "Error uploading image"
        };
      }
    } else {
      console.log("No image file provided or file is invalid");
    }

    const newRoom = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATEBASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      ID.unique(),
      {
        user_id: user.id,
        name: formData.get("name"),
        description: formData.get("description"),
        sqft: formData.get("sqft"),
        capacity: formData.get("capacity"),
        location: formData.get("location"),
        address: formData.get("address"),
        amenities: formData.get("amenities"),
        availability: formData.get("availability"),
        price_per_hour: formData.get("price_per_hour"),
        image: imageID
      }
    );

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.log(error);
    return {
      error: error.response.message || "An unexpected error has occured"
    };
  }
}

export default createRoom;
