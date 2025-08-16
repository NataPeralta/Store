import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Backend URL para Hostinger
const BACKEND_URL = "https://nataperalta.com.ar";

// Google Sheets ID para desarrollo directo
const GOOGLE_SHEETS_ID = "1zRzVHt8hZClYOCWp_iWyYMb1fzEZf6jKeac57cGCaWM";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Construir URL completa si es una ruta relativa
  const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(data ? {} : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    mode: "cors",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Construir URL completa para query keys
    const url = queryKey.join("/") as string;
    const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
    
    const res = await fetch(fullUrl, {
      mode: "cors",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
