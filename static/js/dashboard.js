document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/dashboard_data')
        .then(response => response.json())
        .then(data => {
            console.log(data);

            // Update the HTML with the fetched data
            document.getElementById('total-builders').textContent = data.total_builders || 0;
            document.getElementById('total-projects').textContent = data.total_projects || 0;
            
            // Ensure total_profit is a number before calling .toFixed(2)
            const totalProfit = parseFloat(data.total_profit);
               

            document.getElementById('total-profit').textContent = totalProfit.toFixed(2);
                
            // Ensure avg_monthly_wage is a number before calling .toFixed(2)
            const avgMonthlyWage = parseFloat(data.avg_monthly_wage);


            document.getElementById('avg-monthly-wage').textContent = avgMonthlyWage.toFixed(2);
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
        });

        fetch('/api/recent_projects')
    .then(response => response.json())
    .then(data => {
        // Check if the data is an array and not empty
        if (Array.isArray(data) && data.length > 0) {
            const table = document.getElementById('table2');
            const tbody = table.querySelector('tbody');
            
            // Ensure tbody exists
            if (!tbody) {
                console.error('Tbody element not found');
                return;
            }

            // Clear any existing rows in the table body
            tbody.innerHTML = '';

            // Loop through the data and create rows dynamically
            data.forEach(project => {
                const row = tbody.insertRow();
                row.insertCell().textContent = project.Project_ID;
                row.insertCell().textContent = `${project.client_first_name} ${project.client_last_name}`;
                row.insertCell().textContent = `${project.builder_first_name} ${project.builder_last_name}`;
                row.insertCell().textContent = project.Start_Date;
                row.insertCell().textContent = project.Project_Status;
                row.insertCell().textContent = project.Project_Budget;
            });
        } else {
            console.log('No recent projects available or incorrect response format');
        }
    })
    .catch(error => {
        console.error('Error fetching recent projects:', error);
    });

    fetch('/api/recent_builders')
    .then(response => response.json())
    .then(data => {
        // Check if the data is an array and not empty
        if (Array.isArray(data) && data.length > 0) {
            const table = document.getElementById('builders-table');
            const tbody = table.querySelector('tbody');
            
            // Ensure tbody exists
            if (!tbody) {
                console.error('Tbody element not found');
                return;
            }

            // Clear any existing rows in the table body
            tbody.innerHTML = '';

            // Loop through the data and create rows dynamically
            data.forEach(builder => {
                const row = tbody.insertRow();
                row.insertCell().textContent = builder.builder_first_name;
                row.insertCell().textContent = builder.builder_last_name;
                row.insertCell().textContent = builder.Experience_Years;
            });
        } else {
            console.log('No builders available or incorrect response format');
        }
    })
    .catch(error => {
        console.error('Error fetching recent builders:', error);
    });

});

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
        
        if (columnIndex == 4) {
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
    
    
