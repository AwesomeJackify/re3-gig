export const prerender = false;
import type { APIRoute } from "astro";

import Stripe from "stripe";
const stripe = new Stripe(
  import.meta.env.PROD
    ? import.meta.env.PUBLIC_STRIPE_SECRET_KEY
    : import.meta.env.PUBLIC_STRIPE_TEST_SECRET_KEY
);
export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the request body to get the userId
    const body = await request.json();
    const userId = body.userId;

    // Ensure userId is provided
    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    // Create a new Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      success_url:
        "http://localhost:4321/dashboard/settings?success=Payment Successful", // Redirect after successful payment
      cancel_url: "http://localhost:4321/dashboard/settings", // Redirect if the user cancels
      line_items: [
        {
          price: "price_1QBk8ZC3780jfgXdTmEL5WNk", // Replace with your Stripe price ID
          quantity: 1,
        },
      ],
      mode: "subscription", // For recurring payments (subscription)
      metadata: {
        user_id: userId, // Pass userId in metadata for future reference (e.g., in webhooks)
      },
    });

    // Return the session URL so the frontend can redirect the user
    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (error: any) {
    console.error("Error creating Stripe session:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};
