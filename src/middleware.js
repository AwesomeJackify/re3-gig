export function onRequest(context, next) {
    // Get the URL of the incoming request
    const url = new URL(context.request.url);
    const { cookies, request } = context;


    
    // Retrieve tokens from cookies

    
    // Check if the URL path starts with /course/
    if (url.pathname.startsWith('/course/')) {
        const accessToken = cookies.get("sb-access-token");
        const refreshToken = cookies.get("sb-refresh-token");
        // Redirect to login if the access tokens are missing
        if (!accessToken || !refreshToken) {
        
            // Create a Response object that redirects to "/login"
            return Response.redirect(new URL('/login', request.url), 302);
        }
    }

    

    // Continue to the next middleware or the final handler if the path doesn't match
    return next();
}
