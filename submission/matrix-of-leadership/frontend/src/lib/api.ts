// API configuration
// This allows the frontend to connect to a live cloud backend like Render or a local server.

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_URL = API_URL.replace("http://", "ws://").replace("https://", "wss://");
