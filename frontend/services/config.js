// CloudFront now handles HTTPS termination and proxies /auth/* and /todo/* to EC2
const PRODUCTION_API_URL = "https://dmyooievjdspk.cloudfront.net";

const LOCAL_API_URL = "http://localhost:3000";

export const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? LOCAL_API_URL
    : PRODUCTION_API_URL;

export default API_BASE_URL;
