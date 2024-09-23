import { supabase } from "./lib/supabase";

export async function onRequest(context, next) {
    // Get the URL of the incoming request
    const url = new URL(context.request.url);
    const { cookies, request } = context;

    

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
            const { data, error: sessionError } = await supabase.auth.setSession({
                refresh_token: refreshToken,
                access_token: accessToken,
            });
            
            if (sessionError) {
                
                return sessionError;
            }
    
            // If new tokens are issued, update the cookies
            if (data?.session) {
                const newAccessToken = data.session.access_token;
                const newRefreshToken = data.session.refresh_token;
    
                if (newAccessToken && newRefreshToken) {
                    cookies.set("sb-access-token", newAccessToken, { path: "/", httpOnly: true, secure: true, sameSite: 'Strict' });
                    cookies.set("sb-refresh-token", newRefreshToken, { path: "/", httpOnly: true, secure: true, sameSite: 'Strict' });
                }
            }
    
            return null; // No errors, session is valid
        } catch (error) {
          
            return true; // Indicate an error occurred
        }
    }
    

    // Helper function to handle redirects
    function redirectToLogin() {
        return Response.redirect(new URL('/login', request.url), 302);
    }
}
