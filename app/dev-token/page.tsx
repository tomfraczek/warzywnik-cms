"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

type JwtDebug = {
  iss?: string;
  kid?: string;
  azp?: string;
  sub?: string;
  exp?: number;
  iat?: number;
};

const decodeBase64Url = (value: string) => {
  // base64url -> base64
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  // padding
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  // decode
  return decodeURIComponent(
    Array.prototype.map
      .call(
        atob(padded),
        (c: string) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"),
      )
      .join(""),
  );
};

const readJwtDebug = (token: string): JwtDebug | null => {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const headerJson = JSON.parse(decodeBase64Url(parts[0])) as {
      kid?: string;
    };
    const payloadJson = JSON.parse(decodeBase64Url(parts[1])) as {
      iss?: string;
      azp?: string;
      sub?: string;
      exp?: number;
      iat?: number;
    };

    return {
      kid: headerJson.kid,
      iss: payloadJson.iss,
      azp: payloadJson.azp,
      sub: payloadJson.sub,
      exp: payloadJson.exp,
      iat: payloadJson.iat,
    };
  } catch {
    return null;
  }
};

export default function DevTokenPage() {
  const { getToken, userId } = useAuth();
  const [prefix, setPrefix] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendResult, setBackendResult] = useState<string | null>(null);
  const [jwtDebug, setJwtDebug] = useState<JwtDebug | null>(null);

  const handleGetToken = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      console.log("Clerk token:", token);

      setPrefix(token ? token.slice(0, 20) : null);
      setJwtDebug(token ? readJwtDebug(token) : null);

      if (token) {
        const debug = readJwtDebug(token);
        console.log("JWT debug:", debug);
      }
    } catch (err) {
      console.error("Failed to get token", err);
      setPrefix(null);
      setJwtDebug(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCallBackend = async () => {
    setLoading(true);
    setBackendResult(null);
    try {
      const token = await getToken();
      if (!token) {
        setBackendResult("No token returned from Clerk");
        setJwtDebug(null);
        return;
      }

      const debug = readJwtDebug(token);
      setJwtDebug(debug);
      console.log("JWT debug:", debug);

      const res = await fetch("http://localhost:4000/auth/whoami", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      console.log("Backend status:", res.status);
      console.log("Backend body:", text);

      setBackendResult(`Status: ${res.status}\nBody: ${text}`);
    } catch (err) {
      console.error("Backend call failed", err);
      setBackendResult("Request failed – see console");
    } finally {
      setLoading(false);
    }
  };

  const expIso =
    jwtDebug?.exp != null ? new Date(jwtDebug.exp * 1000).toISOString() : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dev token</h1>

      <p className="text-sm text-zinc-600">User: {userId ?? "(no user)"}</p>

      <div className="flex gap-3">
        <button
          className="rounded bg-zinc-900 px-4 py-2 text-white"
          onClick={handleGetToken}
          disabled={loading}
        >
          {loading ? "Pobieranie..." : "Pobierz token"}
        </button>

        <button
          className="rounded bg-zinc-700 px-4 py-2 text-white"
          onClick={handleCallBackend}
          disabled={loading}
        >
          {loading ? "..." : "Call backend /auth/whoami"}
        </button>
      </div>

      {prefix ? (
        <p className="text-sm text-zinc-700">
          Token (first 20 chars): {prefix}
        </p>
      ) : null}

      {jwtDebug ? (
        <div className="rounded bg-white border border-zinc-200 p-4 text-sm space-y-2">
          <div className="font-semibold text-zinc-900">JWT debug</div>
          <div className="text-zinc-700">iss: {jwtDebug.iss ?? "-"}</div>
          <div className="text-zinc-700">kid: {jwtDebug.kid ?? "-"}</div>
          <div className="text-zinc-700">azp: {jwtDebug.azp ?? "-"}</div>
          <div className="text-zinc-700">sub: {jwtDebug.sub ?? "-"}</div>
          <div className="text-zinc-700">
            exp: {jwtDebug.exp ?? "-"} {expIso ? `(${expIso})` : ""}
          </div>
        </div>
      ) : null}

      {backendResult ? (
        <pre className="rounded bg-zinc-100 p-4 text-sm text-zinc-800 whitespace-pre-wrap">
          {backendResult}
        </pre>
      ) : null}
    </div>
  );
}
