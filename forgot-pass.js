document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = {
                email: document.getElementById('email').value
            };

            fetch('/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send reset link');
                }
                alert('Reset link sent to your email');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to send reset link');
            });
        });
    } else {
        console.error('Forgot Password form not found');
    }
});
