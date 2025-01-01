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
                            <svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M667.8 362.1H304V830c0 28.2 23 51 51.3 51h312.4c28.4 0 51.4-22.8 51.4-51V362.2h-51.3z" fill="#CCCCCC"></path><path d="M750.3 295.2c0-8.9-7.6-16.1-17-16.1H289.9c-9.4 0-17 7.2-17 16.1v50.9c0 8.9 7.6 16.1 17 16.1h443.4c9.4 0 17-7.2 17-16.1v-50.9z" fill="#CCCCCC"></path><path d="M733.3 258.3H626.6V196c0-11.5-9.3-20.8-20.8-20.8H419.1c-11.5 0-20.8 9.3-20.8 20.8v62.3H289.9c-20.8 0-37.7 16.5-37.7 36.8V346c0 18.1 13.5 33.1 31.1 36.2V830c0 39.6 32.3 71.8 72.1 71.8h312.4c39.8 0 72.1-32.2 72.1-71.8V382.2c17.7-3.1 31.1-18.1 31.1-36.2v-50.9c0.1-20.2-16.9-36.8-37.7-36.8z m-293.5-41.5h145.3v41.5H439.8v-41.5z m-146.2 83.1H729.5v41.5H293.6v-41.5z m404.8 530.2c0 16.7-13.7 30.3-30.6 30.3H355.4c-16.9 0-30.6-13.6-30.6-30.3V382.9h373.6v447.2z" fill="#211F1E"></path><path d="M511.6 798.9c11.5 0 20.8-9.3 20.8-20.8V466.8c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0 11.4 9.3 20.7 20.8 20.7zM407.8 798.9c11.5 0 20.8-9.3 20.8-20.8V466.8c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0.1 11.4 9.4 20.7 20.8 20.7zM615.4 799.6c11.5 0 20.8-9.3 20.8-20.8V467.4c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0 11.5 9.3 20.8 20.8 20.8z" fill="#211F1E"></path></g></svg>
                        </button>
                    </td>
                `;

                // Add event listeners for Remove button
                const removeButton = row.querySelector('.remove-btn');

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
