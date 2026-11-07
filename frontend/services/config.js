const PRODUCTION_API_URL = "http://15.135.88.102";
const LOCAL_API_URL = "http://localhost:3000";

export const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? LOCAL_API_URL
    : PRODUCTION_API_URL;

export default API_BASE_URL;
