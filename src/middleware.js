import { supabase } from "./lib/supabase";

export async function onRequest(context, next) {
    console.time('Middleware Execution Time'); // Start the timer

    // Get the URL of the incoming request
    const url = new URL(context.request.url);
    const { cookies, request } = context;

    // Check if the URL path starts with /course/
    if (url.pathname.startsWith('/course/')) {
        // Retrieve tokens from cookies
        const accessToken = cookies.get("sb-access-token");
        const refreshToken = cookies.get("sb-refresh-token");

        // If tokens are missing or there's an error in token validation, redirect to login
        if (!accessToken || !refreshToken) {
            return redirectToLogin();
        }

        // Validate the tokens and set the Supabase session
        const sessionError = await validateSession(accessToken.value, refreshToken.value);

        if (sessionError) {
            // If there is an error with the session, clear cookies and redirect to login
            cookies.delete("sb-access-token", { path: "/" });
            cookies.delete("sb-refresh-token", { path: "/" });
            return redirectToLogin();
        }
    }

    console.timeEnd('Middleware Execution Time'); // End the timer when the middleware is done
    // Continue to the next middleware or the final handler
    return next();

    // Helper function to validate the session
    async function validateSession(accessToken, refreshToken) {
        try {
            const { error: sessionError } = await supabase.auth.setSession({
                refresh_token: refreshToken,
                access_token: accessToken,
            });
            return sessionError;
        } catch (error) {
            console.error('Error validating session:', error);
            return true; // Indicate an error occurred
        }
    }

    // Helper function to handle redirects
    function redirectToLogin() {
        console.timeEnd('Middleware Execution Time'); // End the timer before redirecting
        return Response.redirect(new URL('/login', request.url), 302);
    }
}
