import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../../src/pages/api/auth/register";

const { signUp } = vi.hoisted(() => ({
  signUp: vi.fn(),
}));

vi.mock("../../src/lib/supabase", () => ({
  supabase: {
    auth: { signUp },
  },
}));

function makeContext(form: Record<string, string>) {
  return {
    request: new Request("http://test/api/auth/register", {
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

describe("register API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /register when any required field is missing", async () => {
    const res = await POST(
      makeContext({
        email: "test@test.com",
        password: "secret123",
        confirm_password: "secret123",
        fname: "Jack",
        // lname missing
      }) as never,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/register");
    expect(signUp).not.toHaveBeenCalled();
  });

  it("redirects to /register on Supabase error", async () => {
    signUp.mockResolvedValueOnce({
      error: { message: "User already registered" },
    });

    const res = await POST(
      makeContext({
        email: "test@test.com",
        password: "secret123",
        confirm_password: "secret123",
        fname: "Jack",
        lname: "Gong",
      }) as never,
    );

    expect(signUp).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "secret123",
      options: {
        data: {
          first_name: "Jack",
          last_name: "Gong",
        },
      },
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/register");
  });

  it("redirects to /login on success", async () => {
    signUp.mockResolvedValueOnce({ error: null });

    const res = await POST(
      makeContext({
        email: "test@test.com",
        password: "secret123",
        confirm_password: "secret123",
        fname: "Jack",
        lname: "Gong",
      }) as never,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/login");
  });
});