document.getElementById("addProjectForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const formData = new FormData(this);

    // Prepare data for sending via AJAX
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Send data to Flask backend via AJAX
    fetch("/add_project", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Project added successfully!");
            window.location.href = "/projects"; // Redirect to the projects list page
        } else {
            alert("Failed to add project. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    });
});
