// src/pages/api/webhook.ts
import type { APIRoute } from "astro";
import Stripe from "stripe";
import { supabase } from "../../lib/supabase";
const { data: sessionData } = await supabase.auth.getSession();

const currentUserId = sessionData?.session?.user?.id || null;

export const prerender = false;

// Initialize the Stripe client
const stripe = new Stripe(
  import.meta.env.PROD
    ? import.meta.env.PUBLIC_STRIPE_SECRET_KEY
    : import.meta.env.PUBLIC_STRIPE_TEST_SECRET_KEY
);

// The POST API route to handle Stripe webhooks
export const POST: APIRoute = async ({ request }) => {
  // Make sure to get the raw body for the webhook signature verification
  const rawBody = await request.text(); // Stripe expects the raw body
  const signature = request.headers.get("stripe-signature");

  const endpointSecret =
    "whsec_f2480f20a209a631cca3de7f7df5f343ca48c4c02c8e52a650bc74643bb2ae4d";

  try {
    // Verify the webhook signature to ensure it's from Stripe
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      import.meta.env.PROD
        ? import.meta.env.PUBLIC_STRIPE_WEBHOOK_SECRET
        : endpointSecret
    );

    let session;
    let customerId;
    let userId;

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("PaymentIntent was successful!");
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        console.log("PaymentMethod was attached to a Customer!");
        break;
      // Handle other event types as needed
      case "checkout.session.completed":
        session = event.data.object;
        customerId = session.customer;
        userId = session.metadata?.user_id; // Assuming you are passing user_id in metadata
        if (!userId) {
          console.error("user_id is missing in session metadata.");
          return new Response("user_id is missing in session metadata.", {
            status: 400,
          });
        }

        try {
          // First, check if the user already exists in the `stripe_customers` table
          const { data: existingUser, error: selectError } = await supabase
            .from("stripe_customers")
            .select("*")
            .eq("user_id", userId)
            .single();

          if (existingUser) {
            // User already exists in the database
            console.log(`User ${userId} already exists in stripe_customers.`);
          } else {
            // If the user doesn't exist, insert a new record
            const { data, error } = await supabase
              .from("stripe_customers")
              .insert([{ user_id: userId, customer_id: customerId }]);

            if (error) {
              console.error("Error inserting customerId:", error);
              return new Response(
                `Error inserting customerId: ${error.message}`,
                {
                  status: 500,
                }
              );
            }

            console.log(`CustomerId ${customerId} saved for user ${userId}.`);
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
          });
        } catch (error: any) {
          console.error("Error during user check or insert:", error);
          return new Response(`Error: ${error.message}`, { status: 500 });
        }
      case "customer.subscription.deleted":
        session = event.data.object;
        customerId = session.customer;

        try {
          // First, check if the user already exists in the `stripe_customers` table
          const { data: deletedUser, error: deleteError } = await supabase
            .from("stripe_customers")
            .delete()
            .eq("customer_id", customerId);

          if (deleteError) {
            console.error("Error deleting customerId:", deleteError);
            return new Response(
              `Error inserting customerId: ${deleteError.message}`,
              {
                status: 500,
              }
            );
          }
          console.log(`User ${customerId} deleted from stripe_customers.`);

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
          });
        } catch (error: any) {
          return new Response(`Error: ${error.message}`, { status: 500 });
        }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error("Error verifying webhook signature:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
};
