import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start managing your team&apos;s tasks in seconds.
        </p>
      </div>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
