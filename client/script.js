const PORT = 3000;

const loadNominations = async (email) => {
        const response = await fetch(`http://localhost:${PORT}/api/users/getNominations?email=${encodeURIComponent(email)}`, {
                method: 'GET',
        });

        const data = await response.json();

        const nominationsDiv = document.querySelector('.nominations');

        data.nominations.forEach(nomination => {
                const nominationElement = document.createElement('div');
                nominationElement.classList.add('nomination');

                nominationElement.innerHTML = `
                        <div class="nom-badge">NOMINATION</div>
                        <div class="nom-text">You’ve been nominated by ${nomination.userName} after they ${nomination.description}</div>
                        <div class="complete">
                                <button type="button" class="btn btn-primary" data-toggle="modal"
                                        data-target="#completeButtonModal" style="font-size: 1rem; color: black; display: flex;
                                align-items: center; height: 20px; margin: auto" onclick="localStorage.setItem('chainId', '${nomination.chain}'); localStorage.setItem('eventId', '${nomination.id}')">Complete</button>
                        </div>
                `;

                nominationsDiv.appendChild(nominationElement);
        });
};

const loadFeed = async (email) => {
        const response = await fetch(`http://localhost:${PORT}/api/users/getFeed?email=${encodeURIComponent(email)}`, {
                method: 'GET',
        });

        const data = await response.json();

        const feedDiv = document.querySelector('.feed');

        data.feed.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('item');

                let previousLinks = '';

                let linkCount = 1;
                item.previousLinks.forEach(link => {
                        if (linkCount === 1) {
                                previousLinks = `${link} (${linkCount})`;
                        } else {
                                previousLinks = `${link} (${linkCount}), ` + previousLinks;
                        }

                        linkCount++;
                });

                itemElement.innerHTML = `
                        <div class="item-top-left">
                                <div class="link-text">Link ${item.link}</div>
                                <div class="item-name">${item.userName}</div>
                                <div class="item-text">${item.description}</div>
                        </div>
                        <div class="item-top-right">
                                <div class="item-nominated-title">Nominated</div>
                                <div class="item-nominated">${item.nominatedName}</div>
                        </div>
                        <div class="item-bottom">
                                <div class="item-prevlinks-title">Previous Links</div>
                                <div class="item-prevlinks">
                                        ${previousLinks}
                                </div>
                        </div>
                `;

                feedDiv.appendChild(itemElement);
        });

};

const joinChain = async (chainId, email, description, nominated, eventId, random) => {
        const response = await fetch(`http://localhost:${PORT}/api/users/joinChain`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        chainId,
                        email,
                        description,
                        nominated,
                        eventId,
                        random
                }),
        });

        const data = await response.json();
        return data;
};

const createChain = async (email, description, nominated, random) => {
        const response = await fetch(`http://localhost:${PORT}/api/users/createChain`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        email,
                        description,
                        nominated,
                        random
                }),
        });

        const data = await response.json();
        return data;
};

const generateIdea = async () => {
        const response = await fetch(`http://localhost:${PORT}/api/users/generateIdea`, {
                method: 'GET',
        });

        const data = await response.json();
        return data;
};

const loadPage = async () => {
        const email = localStorage.getItem('email');

        loadNominations(email);
        loadFeed(email);

        const completeButton = document.querySelector('.complete-btn-submit');
        completeButton.addEventListener('click', async () => {
                const chainId = parseInt(localStorage.getItem('chainId'));
                const email = localStorage.getItem('email');
                const description = document.querySelector('.complete-description').value;
                const nominated = document.querySelector('.complete-nominated').value;
                const eventId = parseInt(localStorage.getItem('eventId'));
                const random = document.querySelector('.complete-random').checked;

                await joinChain(chainId, email, description, nominated, eventId, random);

                location.reload();
        });

        const createButton = document.querySelector('.create-btn-submit');
        createButton.addEventListener('click', async () => {
                const email = localStorage.getItem('email');
                const description = document.querySelector('.create-description').value;
                const nominated = document.querySelector('.create-nominated').value;
                const random = document.querySelector('.create-random').checked;

                await createChain(email, description, nominated, random);

                location.reload();
        });

        const generateIdeaButton = document.querySelector('.generate-idea-btn');
        generateIdeaButton.addEventListener('click', async () => {
                const data = await generateIdea();

                document.querySelector('.generate-idea-text').textContent = `⚡️ ${data.message.trim()}`;
        });
};


document.addEventListener('DOMContentLoaded', async () => {
        loadPage();
});
