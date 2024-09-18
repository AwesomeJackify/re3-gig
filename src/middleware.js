import { supabase } from "./lib/supabase";

export async function onRequest(context, next) {
    // Get the URL of the incoming request
    const url = new URL(context.request.url);
    const { cookies, request } = context;

    console.log('Requested URL:', url.pathname);

    // Check if the path requires authentication
    if (shouldAuthenticate(url.pathname)) {
        const accessToken = cookies.get("sb-access-token");
        const refreshToken = cookies.get("sb-refresh-token");

        // If tokens are missing, redirect to login
        if (!accessToken || !refreshToken) {
            return redirectToLogin();
        }

        // Validate the tokens and set the Supabase session
        const sessionError = await validateSession(accessToken.value, refreshToken.value);

        if (sessionError) {
            console.log('Redirecting to login: session validation failed');
            // Clear cookies and redirect to login if validation fails
            cookies.delete("sb-access-token", { path: "/" });
            cookies.delete("sb-refresh-token", { path: "/" });
            return redirectToLogin();
        }
    }

    // Continue to the next middleware or the final handler
    return next();

    // Utility function to determine if authentication is required for a route
    function shouldAuthenticate(pathname) {
        // Define routes that require authentication
        const protectedRoutes = ['/dashboard', '/course'];
        // Check if the current path is exactly '/dashboard' or starts with '/course'
        return protectedRoutes.includes(pathname) || pathname.startsWith('/course/');
    }

    // Helper function to validate the session
    async function validateSession(accessToken, refreshToken) {
        try {
            const { error: sessionError } = await supabase.auth.setSession({
                refresh_token: refreshToken,
                access_token: accessToken,
            });
            if (sessionError) {
                console.log('Supabase session error:', sessionError.message);
            }
            return sessionError;
        } catch (error) {
            console.error('Error validating session:', error);
            return true; // Indicate an error occurred
        }
    }

    // Helper function to handle redirects
    function redirectToLogin() {
        return Response.redirect(new URL('/login', request.url), 302);
    }
}
