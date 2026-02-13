"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import {
  setAuthTokenProvider,
  setUnauthorizedHandler,
} from "@/app/api/restClient";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    setAuthTokenProvider(() => getToken());
    setUnauthorizedHandler(() => signOut({ redirectUrl: "/sign-in" }));
    return () => {
      setAuthTokenProvider(null);
      setUnauthorizedHandler(null);
    };
  }, [getToken, signOut]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
