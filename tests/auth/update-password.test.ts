import { describe, it, expect, vi, beforeEach } from "vitest";

const { updateUser } = vi.hoisted(() => ({
  updateUser: vi.fn(),
}));

vi.mock("../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      updateUser,
    },
  },
}));

import { POST } from "../../src/pages/api/auth/update-password";

function makeContext(form: Record<string, string>) {
  return {
    request: new Request("http://test/api/auth/update-password", {
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

describe("update-password API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /dashboard/settings when passwords do not match", async () => {
    const res = await POST(
      makeContext({
        password: "abc12345",
        confirm_password: "different",
      }) as never,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/dashboard/settings");
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("redirects to /dashboard/settings when updateUser fails", async () => {
    updateUser.mockResolvedValueOnce({ error: { message: "fail" } });

    const res = await POST(
      makeContext({
        password: "abc12345",
        confirm_password: "abc12345",
      }) as never,
    );

    expect(updateUser).toHaveBeenCalledWith({ password: "abc12345" });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/dashboard/settings");
  });

  it("redirects to /dashboard/settings on success", async () => {
    updateUser.mockResolvedValueOnce({ error: null });

    const res = await POST(
      makeContext({
        password: "abc12345",
        confirm_password: "abc12345",
      }) as never,
    );

    expect(updateUser).toHaveBeenCalledWith({ password: "abc12345" });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/dashboard/settings");
  });
});
