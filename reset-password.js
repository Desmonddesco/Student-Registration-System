document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    if (token) {
        document.getElementById('token').value = token;
    } else {
        alert('Invalid or missing token.');
        window.location.href = 'login.html'; // Redirect to login page if token is missing
    }

    resetPasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const token = document.getElementById('token').value;

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const payload = {
            token: token,
            newPassword: newPassword
        };

        fetch('/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to reset password');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            window.location.href = 'login.html'; // Redirect to login page after successful password reset
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to reset password');
        });
    });
});
