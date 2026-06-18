"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/client";
import { signupSchema, formatZodError } from "@/lib/validations";

const EMPTY = { name: "", email: "", password: "", confirmPassword: "" };

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(formatZodError(parsed.error));
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/signup", { method: "POST", body: parsed.data });

      // Auto sign-in after successful registration.
      const res = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (res?.error) {
        toast.success("Account created — please log in");
        router.push("/login");
        return;
      }

      toast.success("Account created. Welcome to TaskFlow!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      toast.error(err.message || "Could not create your account");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: "name", label: "Full name", type: "text", placeholder: "Jane Doe", autoComplete: "name" },
    { key: "email", label: "Email", type: "email", placeholder: "you@company.com", autoComplete: "email" },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {fields.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <Label htmlFor={f.key}>{f.label}</Label>
          <Input
            id={f.key}
            type={f.type}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            value={values[f.key]}
            onChange={update(f.key)}
            aria-invalid={!!errors[f.key]}
          />
          {errors[f.key] && <p className="text-xs text-destructive">{errors[f.key]}</p>}
        </div>
      ))}

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={values.password}
            onChange={update("password")}
            aria-invalid={!!errors.password}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={update("confirmPassword")}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword}</p>
        )}
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
