const jobForm = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");
const searchBox = document.getElementById("searchBox");
const submitBtn = document.getElementById("submitBtn");
const discardBtn = document.getElementById("discardBtn");
const ctx = document.getElementById("statusChart").getContext("2d");

// Summary counters
const appliedCount = document.getElementById("appliedCount");
const interviewingCount = document.getElementById("interviewingCount");
const offeredCount = document.getElementById("offeredCount");
const rejectedCount = document.getElementById("rejectedCount");

// Load jobs
let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
let editIndex = -1;

// Chart.js setup
let statusChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Applied", "Interviewing", "Offered", "Rejected"],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ["#42a5f5", "#ffb74d", "#66bb6a", "#ef5350"]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 20,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a,b) => a+b, 0);
            const percent = total ? ((value/total)*100).toFixed(1) : 0;
            return `${label}: ${value} (${percent}%)`;
          }
        },
        backgroundColor: "#333",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 8,
        displayColors: false
      }
    }
  }
});

// Render jobs
function renderJobs(filter = "") {
  jobList.innerHTML = "";
  jobs
    .filter(job =>
      job.company.toLowerCase().includes(filter) ||
      job.role.toLowerCase().includes(filter)
    )
    .forEach((job, index) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="job-info">
          <strong>${job.company}</strong> - ${job.role}
        </div>
        <span class="status ${job.status}">${job.status}</span>
        <div class="job-actions">
          <button class="edit-btn" onclick="editJob(${index})">Edit</button>
          <button class="delete-btn" onclick="deleteJob(${index})">Delete</button>
        </div>
      `;

      jobList.appendChild(li);
    });

  updateChart();
}

// Add / Update job
jobForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const company = document.getElementById("company").value.trim();
  const role = document.getElementById("role").value.trim();
  const status = document.getElementById("status").value;

  if (editIndex === -1) {
    jobs.push({ company, role, status });
  } else {
    jobs[editIndex] = { company, role, status };
    editIndex = -1;
    submitBtn.textContent = "Add Job";
    discardBtn.style.display = "none";
  }

  localStorage.setItem("jobs", JSON.stringify(jobs));
  jobForm.reset();
  renderJobs();
});

// Edit job
function editJob(index) {
  const job = jobs[index];
  document.getElementById("company").value = job.company;
  document.getElementById("role").value = job.role;
  document.getElementById("status").value = job.status;
  editIndex = index;
  submitBtn.textContent = "Update Job";
  discardBtn.style.display = "inline-block";

  // Scroll smoothly to form
  document.querySelector(".form-section").scrollIntoView({ behavior: "smooth" });
}

// Discard edit
discardBtn.addEventListener("click", () => {
  jobForm.reset();
  editIndex = -1;
  submitBtn.textContent = "Add Job";
  discardBtn.style.display = "none";
});

// Delete job
function deleteJob(index) {
  jobs.splice(index, 1);
  localStorage.setItem("jobs", JSON.stringify(jobs));
  renderJobs();
}

// Search jobs
searchBox.addEventListener("input", (e) => {
  renderJobs(e.target.value.toLowerCase());
});

// Update Chart & Summary
function updateChart() {
  const counts = { Applied: 0, Interviewing: 0, Offered: 0, Rejected: 0 };
  jobs.forEach(job => counts[job.status]++);

  statusChart.data.datasets[0].data = Object.values(counts);
  statusChart.update();

  appliedCount.textContent = counts.Applied;
  interviewingCount.textContent = counts.Interviewing;
  offeredCount.textContent = counts.Offered;
  rejectedCount.textContent = counts.Rejected;
}

// Initial render
renderJobs();
