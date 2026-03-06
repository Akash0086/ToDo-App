import apiFetch from './api.js';

let currentPage=1;let limit=5;
let currentFilters = {};

  function renderTasks(tasks) {
    const tbody=document.getElementById("todo-table");
    tbody.innerHTML="";
    
    //console.log("TYPE:", typeof tasks);
    //console.log("VALUE:", tasks);
    //console.log("IS ARRAY:", Array.isArray(tasks));

    tasks.forEach(task=>{
      const row=document.createElement("tr");

      //store id safely(for delete/edit)
      row.dataset.id = task.id;

      row.innerHTML=`
         <td>${task.id}</td>
         <td>${task.task}</td>
         <td>${task.category}</td>
         <td>
            <span class="status ${task.status}">
              ${task.status}
            </span>
         </td>
         <td>
           <button class="edit-btn">Edit</button>
           <button class="delete-btn">Delete</button>
         </td>
      `;
      console.log("Task status:", task.status);
      tbody.appendChild(row);
    });
  }
  //------------------------PAGINATION-BUTTON-------------------------------

  function renderPagination(totalPages){
    const container=document.getElementById("pagination");
    container.innerHTML="";

    if(totalPages<=1) return;

    const prevBtn=document.createElement("button");
    prevBtn.textContent="prev";
    prevBtn.disabled=currentPage === 1;
    prevBtn.onclick=()=>{
      currentPage--;
      loadTask(currentFilters);
    }
    container.appendChild(prevBtn);

    const pageInfo = document.createElement("span");
    pageInfo.textContent = ` Page ${currentPage} of ${totalPages} `;
    container.appendChild(pageInfo);

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
      currentPage++;
      loadTask(currentFilters);
  };
  container.appendChild(nextBtn);
  }
//-------------------------------------------------------------------
    async function loadTask(filters={}){
      console.log("Loading page:", currentPage);
      try{
        const query = new URLSearchParams(filters).toString();
        console.log(query);

        const data= await apiFetch(
          `http://localhost:3000/todo?page=${currentPage}&limit=${limit}${query ? `&${query}` : ""}`
        );
        
        renderTasks(data.data);//tasks.data give task in array
        renderPagination(data.pagination.totalPages);

      }catch(err){
        console.error(err.message);
      }
    }

    document.addEventListener("DOMContentLoaded",()=>{
          loadTask();
    });

//----------------------------------------------------------

    const tbody = document.getElementById("todo-table");
    
    tbody.addEventListener("click",async(e) =>{
      const row = e.target.closest("tr");
      if(!row) return;

      document.querySelectorAll("#todo-table tr").forEach(tr => {
        tr.classList.remove("active-row");
      });
      row.classList.add("active-row");

      if (e.target.classList.contains("delete-btn")) {
        //console.log("Delete button clicked");
        const row = e.target.closest("tr");
        const taskId = row.dataset.id;
        
        try{
        const res = await apiFetch(`http://localhost:3000/todo/${taskId}`,{ 
          method: "DELETE",
          });

          row.remove();
        }catch(err){
          console.error("Delete failed:", err.message);
        }
        
      };

      //console.log("Selected row:", row);
      
      if (e.target.classList.contains("edit-btn")) {
        /*const row = e.target.closest("tr");
        const taskCell = row.children[1];
        
        const newTask = prompt("Edit task:", taskCell.textContent);
        if (newTask !== null && newTask.trim() !== "") {
          taskCell.textContent = newTask;
        } */
        const row=e.target.closest('tr');
        const taskCell = row.children[1];
        const categoryCell = row.children[2];
        const statusCell = row.children[3];
        const btn = e.target;

        if(btn.textContent === 'Edit'){
          taskCell.innerHTML = `<input value="${taskCell.textContent}">`;
          categoryCell.innerHTML = `<input value="${categoryCell.textContent}">`;
          
          const oldStatus = statusCell.textContent.trim();

          statusCell.innerHTML = `
          <select>
            <option value="pending">pending</option>
            <option value="completed">completed</option>
          </select>
        `;

        statusCell.querySelector("select").value = oldStatus;
        btn.textContent = "Save";

        }
        else {
          const taskId = row.dataset.id;
          const taskValue = taskCell.querySelector("input").value.trim();
          const categoryValue = categoryCell.querySelector("input").value.trim();
          const statusValue = statusCell.querySelector("select").value;

          console.log("Sending:", taskValue, categoryValue, statusValue);

          try{
            await apiFetch(`http://localhost:3000/todo/${taskId}`, {
            method: "PUT",
            body: {
              task: taskValue,
              category: categoryValue,
              status: statusValue
            }
          });
          // Only update UI if backend succeeds
          taskCell.textContent = taskValue;
          categoryCell.textContent = categoryValue;

           statusCell.innerHTML = `
           <span class="status ${statusValue}">
           ${statusValue}
           </span>
           `;
           
           btn.textContent = "Edit";
           loadTask();
          }catch(err){
            console.error("Update failed:", err.message);
            alert("Failed to update task");
          }
        }
      }
    });

//---------------ADD Task------------------

const addBtn=document.querySelector(".add-btn");

addBtn.addEventListener("click",async()=>{
  const task=prompt("Enter task:")
  const category=prompt("Enter category:")
  const status = "pending";

  if(!task || !category) return;

  try{
    const data = await apiFetch("http://localhost:3000/todo",{
      method: "POST",

      headers:{
        "Content-Type": "application/json",
      },
      body:{
        task,
        category,
        status
      },
    });
    console.log("Sending:", { task, category, status });
    console.log("Added:", data);

    loadTask();
  }catch(err){
    console.error("ADD error:",err.message);
  }
});

//-------------Filter logic---------------------

const filterBtn=document.getElementById("filterBtn");

filterBtn.addEventListener("click",()=>{
  console.log("Current page after filter:", currentPage);

  const search = document.getElementById("searchInput").value.trim();
  const category = document.getElementById("categoryFilter").value;
  const status = document.getElementById("statusFilter").value;

  const filters = {};

  if (search) filters.search = search;
  if (category) filters.category = category;
  if (status) filters.status = status;

  currentPage = 1;
  currentFilters=filters;

  loadTask(currentFilters);

  

});

//=================Profile dropdown=========================
const avatar = document.querySelector(".profile-avatar");
const dropdown = document.querySelector(".profile-dropdown");

avatar.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("show");
});

document.addEventListener("click", () => {
  dropdown.classList.remove("show");
});
//===================Logout==========================
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("accessToken");  
  window.location.href = "login.html";    
});