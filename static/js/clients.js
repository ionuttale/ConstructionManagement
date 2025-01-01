// Fetching the client data and handling display in the table
console.log("JavaScript is loaded");
fetch('api/get-clients')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('client-list');
        const searchInput = document.getElementById('search-input');

        // Function to display clients in the table
        function displayClients(clients) {
            tbody.innerHTML = ''; // Clear the current table rows
            clients.forEach(item => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', item.id); // Add data-id attribute for row reference
                row.innerHTML = `
                    <td>${item.first_name}</td>
                    <td>${item.last_name}</td>
                    <td>${item.client_type}</td>
                    <td>${item.registration_date}</td>
                    <td>${item.phone_number}</td>
                    <td>${item.email}</td>
                    <td>${item.address}</td>
                    <td>
                        <button class="remove-btn">
                        <svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M667.8 362.1H304V830c0 28.2 23 51 51.3 51h312.4c28.4 0 51.4-22.8 51.4-51V362.2h-51.3z" fill="#CCCCCC"></path><path d="M750.3 295.2c0-8.9-7.6-16.1-17-16.1H289.9c-9.4 0-17 7.2-17 16.1v50.9c0 8.9 7.6 16.1 17 16.1h443.4c9.4 0 17-7.2 17-16.1v-50.9z" fill="#CCCCCC"></path><path d="M733.3 258.3H626.6V196c0-11.5-9.3-20.8-20.8-20.8H419.1c-11.5 0-20.8 9.3-20.8 20.8v62.3H289.9c-20.8 0-37.7 16.5-37.7 36.8V346c0 18.1 13.5 33.1 31.1 36.2V830c0 39.6 32.3 71.8 72.1 71.8h312.4c39.8 0 72.1-32.2 72.1-71.8V382.2c17.7-3.1 31.1-18.1 31.1-36.2v-50.9c0.1-20.2-16.9-36.8-37.7-36.8z m-293.5-41.5h145.3v41.5H439.8v-41.5z m-146.2 83.1H729.5v41.5H293.6v-41.5z m404.8 530.2c0 16.7-13.7 30.3-30.6 30.3H355.4c-16.9 0-30.6-13.6-30.6-30.3V382.9h373.6v447.2z" fill="#211F1E"></path><path d="M511.6 798.9c11.5 0 20.8-9.3 20.8-20.8V466.8c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0 11.4 9.3 20.7 20.8 20.7zM407.8 798.9c11.5 0 20.8-9.3 20.8-20.8V466.8c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0.1 11.4 9.4 20.7 20.8 20.7zM615.4 799.6c11.5 0 20.8-9.3 20.8-20.8V467.4c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0 11.5 9.3 20.8 20.8 20.8z" fill="#211F1E"></path></g></svg>
                        </button>
                        <button class="modify-btn"><svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 width="800px" height="800px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
<path fill="#231F20" d="M62.829,16.484L47.513,1.171c-1.562-1.563-4.094-1.563-5.657,0L0,43.031V64h20.973l41.856-41.855
	C64.392,20.577,64.392,18.05,62.829,16.484z M18,56H8V46l0.172-0.172l10,10L18,56z"/>
</svg></button>
                    </td>
                `;

                // Add event listeners for Modify and Remove buttons
                const removeButton = row.querySelector('.remove-btn');
                const modifyButton = row.querySelector('.modify-btn');

                removeButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete ${item.first_name}?`)) {
                        // Send delete request to the server
                        fetch(`api/delete-client/${item.id}`, { method: 'DELETE' })
                            .then(response => {
                                if (response.ok) {
                                    // Remove the row from the table on success
                                    row.remove();
                                    alert(`${item.first_name} has been successfully deleted.`);
                                } else {
                                    alert('Failed to delete client.');
                                }
                            })
                            .catch(error => alert('An error occurred while deleting the client.'));
                    }
                });

                modifyButton.addEventListener('click', () => {
                    // Extract the client ID from the row and pass it to the openEditModal function
                    const clientId = row.getAttribute('data-id');
                    openEditModal(item, clientId); // Open the edit modal with the client data
                });

                tbody.appendChild(row);
            });
        }

        // Initial display of all clients
        displayClients(data);

        // Filter clients based on search input
        searchInput.addEventListener('input', function() {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredClients = data.filter(client =>
                client.first_name.toLowerCase().includes(searchTerm) ||
                client.last_name.toLowerCase().includes(searchTerm)
            );
            displayClients(filteredClients);
        });
    })
    .catch(error => console.error('Error fetching client data:', error));

// Modal functionality for editing client data
function openEditModal(client, clientId) {
    const modal = document.getElementById('editModal');
    const closeModal = document.querySelector('.close');

    // Pre-fill the form fields with the current client data
    document.getElementById('first_name').value = client.first_name;
    document.getElementById('last_name').value = client.last_name;
    document.getElementById('phone_number').value = client.phone_number;
    document.getElementById('email').value = client.email;
    document.getElementById('address').value = client.address;

    // Store the clientId globally or pass it to the form submission
    document.getElementById('client_id').value = clientId; // Add a hidden input field for client ID

    // Show the modal
    modal.style.display = 'block';

    // Handle form submission
    const updateForm = document.getElementById('updateForm');
    updateForm.onsubmit = function(event) {
        event.preventDefault();

        const updatedData = {
            id: document.getElementById('client_id').value,  // Extract client ID from the hidden input
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            phone_number: document.getElementById('phone_number').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value
        };

        // Send the updated data to the server
        fetch('/api/update-client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'success') {
                alert('Client data updated successfully!');
                modal.style.display = 'none';
                // Optionally, refresh the client list or update the row in the table
                location.reload(); // Simple approach to reload the page
            } else {
                alert('Failed to update client data.');
            }
        })
        .catch(error => console.error('Error updating client data:', error));
    };
}

// Close the modal when the close button is clicked
const editModal = document.getElementById('editModal');
const closeEditModal = document.querySelector('.close');

window.onload = function() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none'; // Hide the modal by default
};

// Add event listener to close the modal
const closeModalButton = document.querySelector('.close');
closeModalButton.addEventListener('click', () => {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none'; // Hide the modal when the close button is clicked
});

// If you want to also hide the modal when clicking outside of it:
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        modal.style.display = 'none'; // Close the modal when clicking outside
    }
};

closeEditModal.onclick = function() {
    editModal.style.display = 'none';
}

// Close modal if clicked outside of the modal
window.onclick = function(event) {
    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
}

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
