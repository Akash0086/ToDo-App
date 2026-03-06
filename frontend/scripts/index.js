//=================Get started=========================
const getStartedBtn = document.getElementById("getStartedBtn");

getStartedBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const token = localStorage.getItem("accessToken");

  if (token) {
    // user already logged in
    window.location.href = "../pages/dashboard.html";
  } else {
    alert("Please login or register first.");
    window.location.href = "login.html";
  }
});
