console.log("JavaScript is loaded");

// Fetching project data and handling display in the table
fetch('/api/get-projects')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('projects-list');
        const searchInput = document.getElementById('search-input');

        // Function to display projects in the table
        function displayProjects(projects) {
            tbody.innerHTML = ''; // Clear the current table rows
            projects.forEach(item => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', item.Project_ID); // Add data-id attribute for row reference
                row.setAttribute('data-client-id', item.Client_ID); // Store Client_ID as data attribute
                row.setAttribute('data-builder-id', item.Builder_ID); // Store Builder_ID as data attribute
                
                row.innerHTML = `
                    <td>${item.Project_ID}</td>
                    <td>${item.Client_Name}</td> <!-- Display Client Name -->
                    <td>${item.Builder_Name}</td> <!-- Display Builder Name -->
                    <td>${item.Start_Date}</td> <!-- Display Start Date -->
                    <td>${item.Project_Status}</td>
                    <td>${item.Project_Budget.toFixed(2)}<span class="euro-symbol">€</span></td>
                    <td>
                        <button class="remove-btn">
                            <!-- Remove Button Icon -->
                        </button>
                        <button class="modify-btn">
                            <!-- Edit Button Icon -->
                            <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                                width="800px" height="800px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
                                <path fill="#231F20" d="M62.829,16.484L47.513,1.171c-1.562-1.563-4.094-1.563-5.657,0L0,43.031V64h20.973l41.856-41.855
                                C64.392,20.577,64.392,18.05,62.829,16.484z M18,56H8V46l0.172-0.172l10,10L18,56z"/>
                            </svg>
                        </button>
                    </td>
                `;

                // Add event listeners for Remove button
                const removeButton = row.querySelector('.remove-btn');
                const modifyButton = row.querySelector('.modify-btn');

                removeButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete Project ID ${item.Project_ID}?`)) {
                        // Send delete request to the server
                        fetch(`/api/delete-project/${item.Project_ID}`, { method: 'DELETE' })
                            .then(response => {
                                if (response.ok) {
                                    // Remove the row from the table on success
                                    row.remove();
                                    alert(`Project ID ${item.Project_ID} has been successfully deleted.`);
                                } else {
                                    alert('Failed to delete project.');
                                }
                            })
                            .catch(error => alert('An error occurred while deleting the project.'));
                    }
                });

                // Add event listener for Modify button (Edit functionality)
                modifyButton.addEventListener('click', () => {
                    const clientId = row.getAttribute('data-client-id');  // Retrieve Client_ID from row's data attribute
                    const builderId = row.getAttribute('data-builder-id');  // Retrieve Builder_ID from row's data attribute
                    openEditModal(item, clientId, builderId); // Open the edit modal with the correct project data
                });

                tbody.appendChild(row);
            });
        }

        // Initial display of all projects
        displayProjects(data);

        // Filter projects based on search input
        searchInput.addEventListener('input', function () {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredProjects = data.filter(project =>
                project.Client_Name.toLowerCase().includes(searchTerm) ||
                project.Builder_Name.toLowerCase().includes(searchTerm) ||
                project.Project_ID.toLowerCase().includes(searchTerm) // Add additional search criteria
            );
            displayProjects(filteredProjects);
        });
    })
    .catch(error => console.error('Error fetching project data:', error));

// Modal functionality for editing project data
function openEditModal(project, clientId, builderId) {
    const modal = document.getElementById('editProjectModal');
    const closeModal = document.querySelector('.close');

    // Pre-fill the form fields with the current project data
    document.getElementById('project_id').value = project.Project_ID;
    document.getElementById('client_id').value = clientId;  // Use Client_ID passed to modal
    document.getElementById('builder_id').value = builderId; // Use Builder_ID passed to modal
    const formattedStartDate = new Date(project.Start_Date).toISOString().split('T')[0];
    console.log('Formatted Start Date:', formattedStartDate);  // Check the formatted date

    document.getElementById('start_date').value = formattedStartDate; // Ensure Start_Date is passed correctly
    document.getElementById('project_status').value = project.Project_Status;
    document.getElementById('project_budget').value = project.Project_Budget;

    // Show the modal
    modal.style.display = 'block';

    // Handle form submission for updating project data
    const updateForm = document.getElementById('updateProjectForm');
    updateForm.onsubmit = function(event) {
        event.preventDefault();

        const updatedData = {
            Project_ID: document.getElementById('project_id').value,
            Client_ID: document.getElementById('client_id').value,   // Send Client_ID
            Builder_ID: document.getElementById('builder_id').value, // Send Builder_ID
            Start_Date: document.getElementById('start_date').value,
            Project_Status: document.getElementById('project_status').value,
            Project_Budget: document.getElementById('project_budget').value
        };

        // Send the updated data to the server
        fetch('/api/update-project', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Project data updated successfully!');
                modal.style.display = 'none';
                // Optionally, refresh the project list or update the row in the table
                location.reload(); // Simple approach to reload the page
            } else {
                alert('Failed to update project data.');
            }
        })
        .catch(error => console.error('Error updating project data:', error));
    };
}

// Close the modal when the close button is clicked
const closeModalButton = document.querySelector('.close');
closeModalButton.addEventListener('click', () => {
    const modal = document.getElementById('editProjectModal');
    modal.style.display = 'none'; // Hide the modal when the close button is clicked
});

// Close modal if clicked outside of the modal
window.onclick = function(event) {
    const modal = document.getElementById('editProjectModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
