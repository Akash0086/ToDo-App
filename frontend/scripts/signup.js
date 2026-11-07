import { API_BASE_URL } from "../services/config.js";

const form = document.getElementById("signupForm");
console.log("SIGNUP FORM:", form);

if (form) {
  form.addEventListener("submit", async (e) => {
    // Prevent default form page submission/reload
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Front-end password match check
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // POST request to backend signup endpoint
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Signup successful:", data);
        alert("Account created successfully! Redirecting to login...");
        
        // Redirect user to the login page on success
        window.location.href = "/pages/login.html";
      } else {
        const error = await response.json();
        console.error("Signup failed:", error.message);
        alert("Signup Failed: " + (error.message || "Could not register account"));
      }
    } catch (err) {
      console.error("Network or CORS error during signup:", err);
      alert("Network error connecting to backend server.");
    }
  });
}