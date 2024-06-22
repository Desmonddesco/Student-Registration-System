document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            alert('Login successful');
            localStorage.setItem('accessToken', data.accessToken); // Example: Store JWT token in local storage
            window.location.href = 'dashboard.html'; // Redirect to dashboard page after successful login
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('Login failed');
        });
    });
});
