const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let authToken = typeof window !== "undefined" ? localStorage.getItem("finguard_token") : null;

export function setToken(token: string) {
  authToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("finguard_token", token);
  }
}

export function getToken() {
  return authToken;
}

export function clearToken() {
  authToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("finguard_token");
  }
}

function getHeaders() {
  const headers: Record<string, string> = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function uploadCSV(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function fetchGraph() {
  const res = await fetch(`${API_URL}/graph`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch graph");
  return res.json();
}

export async function analyzeGraph() {
  const res = await fetch(`${API_URL}/graph/analyze`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to analyze graph");
  return res.json();
}

export async function submitInvestigation(payload: any) {
  const res = await fetch(`${API_URL}/investigation`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Investigation failed");
  return res.json();
}

export async function fetchChat(question: string, context?: any) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, context }),
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}

export async function downloadReport(investigationId: string) {
  const res = await fetch(`${API_URL}/report/${investigationId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to download report");
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SAR-${investigationId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
