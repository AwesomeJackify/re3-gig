import { describe, it, expect, vi, beforeEach } from "vitest";

const { setSession, updateUser } = vi.hoisted(() => ({
  setSession: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      setSession,
      updateUser,
    },
  },
}));

import { POST } from "../../src/pages/api/auth/reset-password";

function makeContext(form: Record<string, string>) {
  return {
    request: new Request("http://test/api/auth/reset-password", {
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

describe("reset-password API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /reset-password when passwords are missing or do not match", async () => {
    const res = await POST(
      makeContext({
        password: "abc12345",
        confirm_password: "different",
        access_token: "a",
        refresh_token: "r",
      }) as never,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/reset-password");
    expect(setSession).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("redirects to /forgot-password when tokens are missing", async () => {
    const res = await POST(
      makeContext({
        password: "abc12345",
        confirm_password: "abc12345",
      }) as never,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/forgot-password");
    expect(setSession).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("redirects to /reset-password when updateUser fails", async () => {
    setSession.mockResolvedValueOnce({ data: {}, error: null });
    updateUser.mockResolvedValueOnce({ error: { message: "fail" } });

    const res = await POST(
      makeContext({
        password: "abc12345",
        confirm_password: "abc12345",
        access_token: "a-token",
        refresh_token: "r-token",
      }) as never,
    );

    expect(setSession).toHaveBeenCalledWith({
      access_token: "a-token",
      refresh_token: "r-token",
    });
    expect(updateUser).toHaveBeenCalledWith({ password: "abc12345" });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/reset-password");
  });

  it("redirects to /login on success", async () => {
    setSession.mockResolvedValueOnce({ data: {}, error: null });
    updateUser.mockResolvedValueOnce({ error: null });

    const res = await POST(
      makeContext({
        password: "abc12345",
        confirm_password: "abc12345",
        access_token: "a-token",
        refresh_token: "r-token",
      }) as never,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/login");
  });
});