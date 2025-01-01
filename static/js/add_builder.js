document.getElementById('addBuilderForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission

    const formData = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        specialization: document.getElementById('specialization').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        hiring_date: document.getElementById('hiring_date').value,
        experience_years: parseInt(document.getElementById('experience_years').value, 10),
        salary: parseFloat(document.getElementById('salary').value)
    };

    fetch('/api/add-builder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'success') {
                alert('Builder added successfully!');
                window.location.href = '/builders'; // Redirect to the Builders page
            } else {
                alert('Failed to add builder. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
});
