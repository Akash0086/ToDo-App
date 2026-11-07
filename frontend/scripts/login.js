import { API_BASE_URL } from "../services/config.js";

const form = document.getElementById("loginForm");
console.log("FORM:", form);

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log(email, password);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login success", data);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("email", data.user.email);

        // Absolute path to root index.html
        window.location.href = "/index.html";
      } else {
        const error = await response.json();
        console.log("Login Failed", error.message);
        alert(error.message || "Login failed");
      }
    } catch (err) {
      console.error("Network or CORS error during login:", err);
      alert("Network error connecting to backend.");
    }
  });
}