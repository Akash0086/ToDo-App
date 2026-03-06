export default async function apiFetch(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");

  const isJsonBody =
  options.body &&
  typeof options.body === "object" &&
  !(options.body instanceof FormData);

  const response = await fetch(url, {
  ...options,
  headers: {
    ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
    Authorization: `Bearer ${accessToken}`,
  },
  body: isJsonBody ? JSON.stringify(options.body) : options.body,
  credentials: "include",
});

  // If token expired -> try refresh
  if (response.status === 401 || response.status === 403) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // retry original request
      return apiFetch(url, options);
    } else {
      logout();
      throw new Error("Session expired");
    }
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")){
    const data = await response.json();
    if (!response.ok){
      throw new Error(data.message || "Request failed");
    }
    return data;
  }
  
  if (!response.ok){
    throw new Error("Request failed");
  }
  return response;
}

async function refreshAccessToken() {
  try {
    const res = await fetch("http://localhost:3000/auth/refresh", {
      method: "POST",
      credentials: "include", 
    });

    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    return true;

  } catch {
    return false;
  }
}
