"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { Query } from "node-appwrite";
import { redirect } from "next/navigation";
import checkAuth from "./checkAuth";

async function getMybookings() {
  const sessionCookie = (await cookies()).get("appwrite-session");
  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    const { user } = await checkAuth();
    if (!user) {
      return {
        error: "You must be logged in to view bookings"
      };
    }

    const { documents: bookings } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATEBASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOOKINGS,
      [Query.equal("user_id", user.id)]
    );

    return bookings;
  } catch (error) {
    console.log("Failed to get user bookings", error);
    return {
      error: "Failed to get bookings"
    };
  }
}

export default getMybookings;
