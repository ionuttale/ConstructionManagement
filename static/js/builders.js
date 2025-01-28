// builders.js

// Wait for the DOM to be loaded before running the script
document.addEventListener("DOMContentLoaded", function () {
    // Fetch and display the list of builders when the page loads
    fetchBuilders();

    // Event listener for search input field
    document.getElementById('search-input').addEventListener('input', function () {
        filterTable(this.value);
    });
});

// Fetch and display the list of builders from the API
function fetchBuilders() {
    fetch('/api/get-builders')
        .then(response => response.json())
        .then(builders => {
            const builderList = document.getElementById('builder-list');
            builderList.innerHTML = ''; // Clear any existing builder rows

            builders.forEach(builder => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${builder.First_Name}</td>
                    <td>${builder.Last_Name}</td>
                    <td>${builder.Specialization || 'N/A'}</td>
                    <td>${new Date(builder.Hiring_Date).toLocaleDateString()}</td>
                    <td>${builder.Phone}</td>
                    <td>${builder.Email}</td>
                    <td>${builder.Address}</td>
                    <td>${builder.Experience_Years || 'N/A'}</td>
                    <td>${builder.Salary}</td>
                    <td>
                        <button onclick="openEditModal(${builder.Builder_ID})">Edit</button>
                        <button onclick="deleteBuilder(${builder.Builder_ID})">Delete</button>
                    </td>
                `;
                builderList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching builders:', error);
        });
}

// Filter table rows based on search input
function filterTable(query) {
    const rows = document.querySelectorAll('#builder-list tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const match = Array.from(cells).some(cell => cell.innerText.toLowerCase().includes(query.toLowerCase()));
        row.style.display = match ? '' : 'none';
    });
}

// Sort table by column index (asc/desc)
function sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    const rows = Array.from(table.querySelectorAll('tbody tr'));

    const sortedRows = rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].innerText;
        const cellB = rowB.cells[columnIndex].innerText;

        // Sort in ascending or descending order based on the current sort order
        if (table.dataset.sortOrder === 'asc') {
            return cellA > cellB ? 1 : (cellA < cellB ? -1 : 0);
        } else {
            return cellA < cellB ? 1 : (cellA > cellB ? -1 : 0);
        }
    });

    // Update the table with sorted rows
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    sortedRows.forEach(row => tbody.appendChild(row));

    // Toggle the sort order for next sort action
    table.dataset.sortOrder = table.dataset.sortOrder === 'asc' ? 'desc' : 'asc';
}

// Open the edit modal and populate it with builder data
function openEditModal(builderId) {
    fetch(`/api/get-builder/${builderId}`)
        .then(response => response.json())
        .then(builder => {
            // Populate the modal form fields with the builder's data
            document.getElementById('builder_id').value = builder.Builder_ID;
            document.getElementById('firstName').value = builder.First_Name;
            document.getElementById('lastName').value = builder.Last_Name;
            document.getElementById('specialization').value = builder.Specialization || '';  // Set default if null
            // Remove the following lines since we're not using 'hiringDate' and 'experience'
            // document.getElementById('hiringDate').value = builder.Hiring_Date.split('T')[0];
            // document.getElementById('experience').value = builder.Experience_Years;

            document.getElementById('phone').value = builder.Phone;
            document.getElementById('email').value = builder.Email;
            document.getElementById('address').value = builder.Address;
            document.getElementById('salary').value = builder.Salary;

            // Show the modal
            document.getElementById('editModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching builder data:', error);
        });
}

// Submit the form and update builder information
document.getElementById('builderForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission

    // Collect the form data
    const builderId = document.getElementById('builder_id').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const specialization = document.getElementById('specialization').value;
    // Removed hiringDate and experience
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const salary = document.getElementById('salary').value;

    // Validate the form fields
    if (!firstName || !lastName || !phone || !email || !address || !salary) {
        alert("Please fill in all required fields.");
        return;
    }

    // Prepare the data to be sent to the backend
    const data = {
        id: builderId,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        email: email,
        address: address,
        salary: salary,
        specialization: specialization // Keep the specialization if it's needed
    };

    // Send the data via AJAX (fetch API)
    fetch('/api/update-builder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)  // Send the data as JSON
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "success") {
            alert("Builder information updated successfully!");
            closeModal();  // Close the modal after successful update

            // Refresh the page
            window.location.reload();
        } else {
            alert("Error updating builder: " + (data.error || data.details));
        }
    })
    .catch(error => {
        console.error("Error during update:", error);
        alert("An error occurred while updating builder data.");
    });
});
// Close the modal
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Delete a builder by ID
function deleteBuilder(builderId) {
    if (confirm('Are you sure you want to delete this builder?')) {
        fetch(`/api/delete-builder/${builderId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(result => {
                if (result.message === 'success') {
                    fetchBuilders();
                } else {
                    alert('Error deleting builder: ' + result.error);
                }
            })
            .catch(error => {
                console.error('Error deleting builder:', error);
            });
    }
}
