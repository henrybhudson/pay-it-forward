const PORT = 3000;

const login = async (email, password) => {
        const response = await fetch(`http://localhost:${PORT}/api/users/login`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        email,
                        password
                }),
        });

        const data = await response.json();
        return data;
};

document.addEventListener('DOMContentLoaded', async () => {
        document.querySelector('.login-btn').addEventListener('click', async () => {
                const email = document.querySelector('#email').value;
                const password = document.querySelector('#password').value;

                const data = await login(email, password);

                if (data.message === 'Login successful.') {
                        localStorage.setItem('email', email);
                        window.location.href = 'index.html';
                } else {
                        alert(data.message);
                }
        });
});


