import { describe, it, expect } from "vitest";
import {
  taskSchema,
  signupSchema,
  commentSchema,
} from "@/lib/validations";
import { isValidObjectId, canViewTask, isTaskCreator } from "@/lib/authz";
import { generateAvatar } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

describe("taskSchema", () => {
  it("accepts a minimal valid task", () => {
    const result = taskSchema.safeParse({
      title: "Fix bug",
      priority: "High",
      status: "Todo",
      assignedTo: "cuid123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = taskSchema.safeParse({ title: "", priority: "High", status: "Todo", assignedTo: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    const result = taskSchema.safeParse({ title: "T", priority: "Extreme", status: "Todo", assignedTo: "x" });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  const valid = { name: "Alice", email: "alice@example.com", password: "Secret123", confirmPassword: "Secret123" };

  it("accepts a valid signup payload", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a malformed email", () => {
    expect(signupSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a password without uppercase", () => {
    expect(signupSchema.safeParse({ ...valid, password: "secret123", confirmPassword: "secret123" }).success).toBe(false);
  });

  it("rejects mismatched confirmPassword", () => {
    expect(signupSchema.safeParse({ ...valid, confirmPassword: "Different1" }).success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("accepts non-empty body", () => {
    expect(commentSchema.safeParse({ body: "Looks good" }).success).toBe(true);
  });

  it("rejects an empty body", () => {
    expect(commentSchema.safeParse({ body: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Authorization helpers
// ---------------------------------------------------------------------------

describe("isValidObjectId", () => {
  it("accepts a non-empty string", () => {
    expect(isValidObjectId("cjld2cjxh0000qzrmn831i7rn")).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(isValidObjectId("")).toBe(false);
  });

  it("rejects non-strings", () => {
    expect(isValidObjectId(null)).toBe(false);
    expect(isValidObjectId(undefined)).toBe(false);
    expect(isValidObjectId(123)).toBe(false);
  });
});

describe("canViewTask", () => {
  const task = { createdById: "user-a", assignedToId: "user-b" };

  it("allows the creator to view", () => {
    expect(canViewTask(task, "user-a")).toBe(true);
  });

  it("allows the assignee to view", () => {
    expect(canViewTask(task, "user-b")).toBe(true);
  });

  it("blocks an unrelated user", () => {
    expect(canViewTask(task, "user-c")).toBe(false);
  });
});

describe("isTaskCreator", () => {
  const task = { createdById: "user-a", assignedToId: "user-b" };

  it("returns true for the creator", () => {
    expect(isTaskCreator(task, "user-a")).toBe(true);
  });

  it("returns false for the assignee who is not the creator", () => {
    expect(isTaskCreator(task, "user-b")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Avatar generation
// ---------------------------------------------------------------------------

describe("generateAvatar", () => {
  it("returns a non-empty URL string for any name", () => {
    const url = generateAvatar("Ada Lovelace");
    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
  });

  it("returns different URLs for different names", () => {
    expect(generateAvatar("Alice")).not.toBe(generateAvatar("Bob"));
  });
});
