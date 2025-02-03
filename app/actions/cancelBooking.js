"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import checkAuth from "./checkAuth";

async function cancelBooking(bookingId) {
  const sessionCookie = (await cookies()).get("appwrite-session");
  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    const { user } = await checkAuth();

    if (!user) {
      return {
        error: "You must be logged in to cancel a booking"
      };
    }

    const booking = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATEBASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOOKINGS,
      bookingId
    );

    if (booking.user_id !== user.id) {
      return {
        error: "You are not authorized to cancel this booking"
      };
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATEBASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOOKINGS,
      bookingId
    );

    revalidatePath("/bookings", "layout");
    return {
      success: true
    };
  } catch (error) {
    console.log("Failed to cancel booking", error);
    return {
      error: "Failed to cancel booking"
    };
  }
}

export default cancelBooking;
