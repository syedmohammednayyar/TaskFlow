import { describe, it, expect } from "vitest";
import {
  signupSchema,
  loginSchema,
  taskSchema,
  formatZodError,
} from "@/lib/validations";

describe("signupSchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "Str0ngPass",
    confirmPassword: "Str0ngPass",
  };

  it("accepts a valid signup", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects weak passwords (no uppercase/number)", () => {
    const res = signupSchema.safeParse({ ...valid, password: "weakpass", confirmPassword: "weakpass" });
    expect(res.success).toBe(false);
  });

  it("rejects mismatched confirmation", () => {
    const res = signupSchema.safeParse({ ...valid, confirmPassword: "Different1" });
    expect(res.success).toBe(false);
    expect(formatZodError(res.error)).toHaveProperty("confirmPassword");
  });

  it("rejects invalid email", () => {
    const res = signupSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(res.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires email and password", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(false);
  });
});

describe("taskSchema", () => {
  it("accepts a valid task", () => {
    const res = taskSchema.safeParse({
      title: "Ship it",
      description: "",
      priority: "High",
      status: "Todo",
      assignedTo: "507f1f77bcf86cd799439011",
    });
    expect(res.success).toBe(true);
  });

  it("rejects an invalid priority enum", () => {
    const res = taskSchema.safeParse({
      title: "Ship it",
      priority: "Urgent",
      status: "Todo",
      assignedTo: "507f1f77bcf86cd799439011",
    });
    expect(res.success).toBe(false);
  });

  it("requires an assignee", () => {
    const res = taskSchema.safeParse({
      title: "Ship it",
      priority: "Low",
      status: "Todo",
      assignedTo: "",
    });
    expect(res.success).toBe(false);
  });
});
