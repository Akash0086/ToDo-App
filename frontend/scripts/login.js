//alert("login.js loaded");
const form = document.getElementById("loginForm");
console.log("FORM:", form);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log(email, password);

  const response=await fetch('http://localhost:3000/auth/login',{
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body:JSON.stringify({email,password})
  });

  if(response.ok){
    const data = await response.json();
    console.log("Login success", data);
    localStorage.setItem("accessToken", data.accessToken);

    localStorage.setItem("username", data.user.username);
    localStorage.setItem("email", data.user.email);

    window.location.href = "../pages/index.html";

  }else{
    const error=await response.json();
    console.log("login Failed",error.message);
  }

});
