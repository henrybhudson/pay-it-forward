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
                        <div class="complete">Complete</div>
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

const loadPage = async () => {
        const email = localStorage.getItem('email');

        loadNominations(email);
        loadFeed(email);
};


document.addEventListener('DOMContentLoaded', async () => {
        loadPage();
});
