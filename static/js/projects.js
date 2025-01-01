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
                row.innerHTML = `
                    <td>${item.Project_ID}</td>
                    <td>${item.Client_Name}</td>
                    <td>${item.Builder_Name}</td>
                    <td>${item.Start_Date}</td>
                    <td>${item.Project_Status}</td>
                    <td>${item.Project_Budget.toFixed(2)}<span class="euro-symbol">€</span></td>
                    <td>
                        <button class="remove-btn">
                            <svg viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                                <!-- SVG content for the remove button -->
                            </svg>
                        </button>
                        <button class="modify-btn">
                            <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 64 64">
                                <!-- SVG content for the modify button -->
                            </svg>
                        </button>
                    </td>
                `;

                // Add event listeners for Modify and Remove buttons
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

                modifyButton.addEventListener('click', () => {
                    // Extract the project ID from the row and pass it to the openEditModal function
                    const projectId = row.getAttribute('data-id');
                    openEditModal(item, projectId); // Open the edit modal with the project data
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
                project.projectId.toLowerCase().includes(searchTerm) // Add additional search criteria
            );
            displayProjects(filteredProjects);
        });
    })
    .catch(error => console.error('Error fetching project data:', error));

// Modal functionality for editing project data
function openEditModal(project, projectId) {
    const modal = document.getElementById('editModal');
    const closeModal = document.querySelector('.close');

    // Pre-fill the form fields with the current project data
    document.getElementById('project_id').value = project.Project_ID;
    document.getElementById('client_name').value = project.Client_Name;
    document.getElementById('builder_name').value = project.Builder_Name;
    document.getElementById('start_date').value = project.Start_Date;
    document.getElementById('project_status').value = project.Project_Status;
    document.getElementById('project_budget').value = project.Project_Budget;

    // Show the modal
    modal.style.display = 'block';

    // Handle form submission
    const updateForm = document.getElementById('updateForm');
    updateForm.onsubmit = function (event) {
        event.preventDefault();

        const updatedData = {
            Project_ID: document.getElementById('project_id').value,
            Client_Name: document.getElementById('client_name').value,
            Builder_Name: document.getElementById('builder_name').value,
            Start_Date: document.getElementById('start_date').value,
            Project_Status: document.getElementById('project_status').value,
            Project_Budget: parseFloat(document.getElementById('project_budget').value)
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
                if (data.message === 'success') {
                    alert('Project data updated successfully!');
                    modal.style.display = 'none';
                    location.reload(); // Simple approach to reload the page
                } else {
                    alert('Failed to update project data.');
                }
            })
            .catch(error => console.error('Error updating project data:', error));
    };
}

// Close the modal when the close button is clicked
const editModal = document.getElementById('editModal');
const closeEditModal = document.querySelector('.close');

window.onload = function () {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none'; // Hide the modal by default
};

closeEditModal.onclick = function () {
    editModal.style.display = 'none';
};

// Close modal if clicked outside of the modal
window.onclick = function (event) {
    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
};

function sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId); // Select the specific table by ID
    const tbody = table.querySelector('tbody'); // Select the table body
    const rows = Array.from(tbody.querySelectorAll('tr')); // Convert rows to an array

    // Determine sort direction based on the table's data-sortOrder attribute
    const isAscending = table.dataset.sortOrder !== 'asc';
    table.dataset.sortOrder = isAscending ? 'asc' : 'desc';

    // Sort rows based on the selected column's text content
    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();

        if (columnIndex == 3) {
            // Custom parsing for the date column (assume format: "Weekday, day month year time")
            const parseDate = (dateString) => {
                const parts = dateString.split(' '); // Split the date string
                const day = parseInt(parts[1], 10); // Extract the day
                const month = new Date(Date.parse(`${parts[2]} 1, 2000`)).getMonth(); // Extract the month
                const year = parseInt(parts[3], 10); // Extract the year
                return new Date(year, month, day); // Return a Date object
            };

            const dateA = parseDate(cellA);
            const dateB = parseDate(cellB);

            return isAscending ? dateA - dateB : dateB - dateA;
        }

        if (columnIndex == 5) {
            // Remove non-numeric characters (like the Euro symbol) and convert to float
            const priceA = parseFloat(cellA.replace('€', '').trim());
            const priceB = parseFloat(cellB.replace('€', '').trim());
    
            return isAscending ? priceA - priceB : priceB - priceA;
        }

        // Sort numerically if both cells are numbers
        if (!isNaN(cellA) && !isNaN(cellB)) {
            return isAscending ? cellA - cellB : cellB - cellA;
        }

        // Sort alphabetically for text
        return isAscending
            ? cellA.localeCompare(cellB)
            : cellB.localeCompare(cellA);
    });

    // Append the sorted rows back to the tbody
    rows.forEach(row => tbody.appendChild(row));
}
