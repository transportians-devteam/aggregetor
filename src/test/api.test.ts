import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage, idempotencyKey } from "@/services/api";

describe("API client helpers", () => {
  it("uses the backend problem detail when a request fails", () => {
    const error = new AxiosError(
      "Bad request",
      "400",
      { headers: new AxiosHeaders() },
      undefined,
      {
        data: { detail: "The application is not ready for submission." },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new AxiosHeaders() },
      },
    );
    expect(getErrorMessage(error)).toBe(
      "The application is not ready for submission.",
    );
  });

  it("falls back safely for unknown failures", () => {
    expect(getErrorMessage(null, "Try again later.")).toBe("Try again later.");
  });

  it("creates unique, operation-scoped idempotency keys", () => {
    const first = idempotencyKey("topup");
    const second = idempotencyKey("topup");
    expect(first).toMatch(/^topup-[0-9a-f-]{36}$/);
    expect(second).not.toBe(first);
  });
});
