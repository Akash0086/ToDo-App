import { API_BASE_URL } from "../services/config.js";

//alert("login.js loaded");
const form = document.getElementById("loginForm");
console.log("FORM:", form);

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

      window.location.href = "../pages/index.html";
    } else {
      const error = await response.json();
      console.log("Login Failed", error.message);
    }
  } catch (err) {
    console.error("Network or CORS error during login:", err);
  }
});