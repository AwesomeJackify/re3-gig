import type { APIRoute } from "astro";
import Stripe from "stripe";
import { supabase } from "../../lib/supabase";

export const prerender = false;

// Initialize the Stripe client
const stripe = new Stripe(
  import.meta.env.PROD
    ? import.meta.env.STRIPE_SECRET_KEY
    : import.meta.env.TEST_STRIPE_SECRET_KEY
);

const webhookSecret = "whsec_f2480f20a209a631cca3de7f7df5f343ca48c4c02c8e52a650bc74643bb2ae4d";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err: unknown) {
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.user_id;
    const customerId = session.customer as string;

    if (!userId) return new Response("Missing user_id", { status: 400 });

    await supabase.from("stripe_customers").upsert({
      user_id: userId,
      customer_id: customerId,
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name,
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    await supabase
      .from("stripe_customers")
      .delete()
      .eq("customer_id", customerId);
  }

  return new Response("ok", { status: 200 });
};