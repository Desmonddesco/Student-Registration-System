document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');

    if (registrationForm) {
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!isValidPassword(password)) {
                alert('Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.');
                return;
            }

            if (password === email) {
                alert('Password should not be the same as the email.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            const formData = {
                title: document.getElementById('title').value,
                first_name: document.getElementById('firstName').value,
                surname: document.getElementById('surname').value,
                street: document.getElementById('street').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip_code: document.getElementById('zip').value,
                email: email,
                highest_qualification: document.getElementById('qualifications').value,
                password: password
            };

            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to register');
                }
                alert('Registration successful');
                window.location.href = 'login.html'; // Redirect to login page after successful registration
            })
            .catch(error => {
                console.error('Registration error:', error);
                alert('Registration failed');
            });
        });
    } else {
        console.error('Registration form not found');
    }

    function isValidPassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }
});
