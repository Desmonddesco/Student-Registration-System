document.addEventListener('DOMContentLoaded', function() {
    const userDetailsForm = document.getElementById('userDetailsForm');
    const dashboardLink = document.getElementById('dashboardLink');
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');
    const dashboardSection = document.getElementById('dashboardSection');
    const profileSection = document.getElementById('profileSection');

    function showSection(section) {
        dashboardSection.style.display = 'none';
        profileSection.style.display = 'none';
        section.style.display = 'block';
    }

    dashboardLink.addEventListener('click', function() {
        showSection(dashboardSection);
    });

    profileLink.addEventListener('click', function() {
        showSection(profileSection);
    });

    logoutLink.addEventListener('click', function() {
        fetch('/logout', {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                window.location.href = 'login.html';
            } else {
                alert('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error logging out:', error);
            alert('Logout failed');
        });
    });

    // Fetch user data when the page loads
    function fetchUserData() {
        fetch('/user')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                return response.json();
            })
            .then(data => {
                // Populate form fields with user data
                document.getElementById('title').value = data.title;
                document.getElementById('firstName').value = data.first_name;
                document.getElementById('surname').value = data.surname;
                document.getElementById('street').value = data.address_street;
                document.getElementById('city').value = data.address_city;
                document.getElementById('state').value = data.address_state;
                document.getElementById('zip').value = data.zip_code;
                document.getElementById('email').value = data.email;
                document.getElementById('qualifications').value = data.highest_qualification;

                // Display user info on dashboard
                const userInfo = document.getElementById('userInfo');
                userInfo.innerHTML = `
                    <p><strong>Title:</strong> ${data.title}</p>
                    <p><strong>First Name:</strong> ${data.first_name}</p>
                    <p><strong>Surname:</strong> ${data.surname}</p>
                    <p><strong>Street:</strong> ${data.address_street}</p>
                    <p><strong>City:</strong> ${data.address_city}</p>
                    <p><strong>State:</strong> ${data.address_state}</p>
                    <p><strong>Zip Code:</strong> ${data.zip_code}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Qualifications:</strong> ${data.highest_qualification}</p>
                `;
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                alert('Failed to fetch user data');
            });
    }

    // Fetch the logged-in user's data
    fetchUserData();

    // Handle profile update form submission
    userDetailsForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const updatedData = {
            title: document.getElementById('title').value,
            first_name: document.getElementById('firstName').value,
            surname: document.getElementById('surname').value,
            address_street: document.getElementById('street').value,
            address_city: document.getElementById('city').value,
            address_state: document.getElementById('state').value,
            zip_code: document.getElementById('zip').value,
            email: document.getElementById('email').value,
            highest_qualification: document.getElementById('qualifications').value
        };

        fetch('/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update user data');
            }
            return response.json();
        })
        .then(data => {
            alert('Profile updated successfully');
            fetchUserData(); // Refresh user data
        })
        .catch(error => {
            console.error('Error updating user data:', error);
            alert('Email already registered');
        });
    });
});
