export type ClerkTokenGetter = () => Promise<string | null | undefined>;

let tokenGetter: ClerkTokenGetter | null = null;

export const setClerkTokenGetter = (getter: ClerkTokenGetter | null) => {
  tokenGetter = getter;
};

export const getClerkToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;
  if (!tokenGetter) return null;
  try {
    const token = await tokenGetter();
    return token ?? null;
  } catch {
    return null;
  }
};
