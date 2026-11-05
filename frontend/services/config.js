const PRODUCTION_API_URL = "http://3.26.101.96";

const LOCAL_API_URL = "http://localhost:3000";

export const API_BASE_URL = 
  process.env.NODE_ENV === "production" 
    ? PRODUCTION_API_URL 
    : LOCAL_API_URL;

export default API_BASE_URL;