import { describe, it, expect, vi, beforeEach } from "vitest";

const { resetPasswordForEmail } = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn()
}));

vi.mock("../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail,
    },
  },
}));

import { POST } from "../../src/pages/api/auth/forgot-password";

function makeContext(form: Record<string, string>) {
  return {
    request: new Request("http://test/api/auth/forgot-password", {
      method: "POST",
      body: new URLSearchParams(form),
    }),
    cookies: {
      get() { },
      set() { },
      delete() { },
    },
    redirect: (location: string, status = 302) =>
      new Response(null, {
        status,
        headers: { Location: location },
      }),
  };
}

describe("forgot-password API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /forgot-password when email is missing", async () => {
    const res = await POST(makeContext({}) as never);

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/forgot-password");
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("redirects to /forgot-password when resetPasswordForEmail fails", async () => {
    resetPasswordForEmail.mockResolvedValueOnce({
      error: { message: "Error sending password reset email" },
    });

    const res = await POST(
      makeContext({
        email: "test@test.com",
      }) as never,
    );

    expect(resetPasswordForEmail).toHaveBeenCalledWith("test@test.com", {
      redirectTo: "https://rethree.online/reset-password",
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/forgot-password");
  });

  it("redirects to /forgot-password on success", async () => {
    resetPasswordForEmail.mockResolvedValueOnce({
      error: null,
    });

    const res = await POST(
      makeContext({
        email: "test@test.com",
      }) as never,
    );

    expect(resetPasswordForEmail).toHaveBeenCalledWith("test@test.com", {
      redirectTo: "https://rethree.online/reset-password",
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/forgot-password");
  });
});
