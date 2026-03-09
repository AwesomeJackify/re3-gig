import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../../src/pages/api/auth/login";

const { signInWithPassword } = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
}));

vi.mock("../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword,
    },
  },
}));

function makeContext(form: Record<string, string>) {
  return {
    request: new Request("http://test/api/auth/login", {
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

describe("login API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing email", async () => {
    const response = await POST(makeContext({ password: "secret123" }) as never);

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toContain("/login");
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects missing password", async () => {
    const response = await POST(makeContext({ email: "test@test.com" }) as never);

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toContain("/login");
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects invalid credentials", async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });

    const response = await POST(
      makeContext({ email: "test@test.com", password: "wrongpass" }) as never,
    );

    expect(signInWithPassword).toHaveBeenCalled();
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toContain("/login");
  });

  it("redirects to dashboard on success", async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: "user-1" },
        session: {
          access_token: "access-token",
          refresh_token: "refresh-token",
        },
      },
      error: null,
    });

    const response = await POST(
      makeContext({ email: "test@test.com", password: "correctpass" }) as never,
    );

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "correctpass",
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toContain("/dashboard");
  });
});