"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { LazyMotion } from "framer-motion";

// Load animation features asynchronously so they land in a separate webpack chunk.
const loadFeatures = () => import("framer-motion").then((mod) => mod.domMax);

const fetcher = async (url) => {
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(json.message || "Request failed");
    error.status = res.status;
    error.info = json;
    throw error;
  }
  return json.data;
};

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}

export function Providers({ children, session, nonce }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        nonce={nonce}
      >
        <LazyMotion features={loadFeatures} strict>
          <SWRConfig
            value={{ fetcher, revalidateOnFocus: false, dedupingInterval: 4000 }}
          >
            {children}
            <ThemedToaster />
          </SWRConfig>
        </LazyMotion>
      </ThemeProvider>
    </SessionProvider>
  );
}
