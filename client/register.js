const PORT = 3000;

const register = async (name, email, password, random) => {
        const response = await fetch(`http://localhost:${PORT}/api/users/register`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        name,
                        email,
                        password,
                        random
                }),
        });

        const data = await response.json();
        return data;
};

document.addEventListener('DOMContentLoaded', async () => {
        document.querySelector('.register-btn').addEventListener('click', async () => {
                const name = document.querySelector('#name').value;
                const email = document.querySelector('#email').value;
                const password = document.querySelector('#password').value;
                const random = document.querySelector('#random').checked;

                const data = await register(name, email, password, random);

                if (data.message === 'Registration successful.') {
                        localStorage.setItem('email', email);
                        window.location.href = 'index.html';
                } else {
                        alert(data.message);
                }
        });
});


