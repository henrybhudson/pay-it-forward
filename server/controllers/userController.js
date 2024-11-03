const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const login = async (req, res) => {
        try {
                const { email, password } = req.body;

                if (!email || !password) {
                        return res.status(400).json({ message: 'Please provide email and password.' });
                }

                const filePath = path.join(__dirname, '..', 'database', 'users.json');
                const data = await fs.readFile(filePath, 'utf-8');
                const users = JSON.parse(data);

                const user = users.find((user) => user.email === email && user.password === password);

                if (!user) {
                        return res.status(401).json({ message: 'Invalid email or password.' });
                }

                res.status(200).json({ message: 'Login successful.' });
        } catch (error) {
                res.status(500).json({ message: error.message });
        }
};

const getFeed = async (req, res) => {
        try {
                const { email } = req.query;

                const usersPath = path.join(__dirname, '..', 'database', 'users.json');
                const eventsPath = path.join(__dirname, '..', 'database', 'events.json');
                const chainsPath = path.join(__dirname, '..', 'database', 'chains.json');

                const usersData = await fs.readFile(usersPath, 'utf-8');
                const eventsData = await fs.readFile(eventsPath, 'utf-8');
                const chainsData = await fs.readFile(chainsPath, 'utf-8');

                const users = JSON.parse(usersData);
                const events = JSON.parse(eventsData);
                const chains = JSON.parse(chainsData);

                const user = users.find(u => u.email === email);

                const { following } = user;

                const getNameByEmail = (email) => {
                        const user = users.find(u => u.email === email);
                        return user ? user.name : null;
                };

                const userFeed = events
                        .filter(event => following.includes(event.user))
                        .map(event => {
                                const chain = chains.find(c => c.id === event.chain);

                                const previousLinks = chain.users
                                        .slice(0, chain.users.indexOf(event.user))
                                        .map(getNameByEmail);

                                return {
                                        ...event,
                                        userName: getNameByEmail(event.user),
                                        nominatedName: getNameByEmail(event.nominated),
                                        previousLinks
                                };
                        })
                        .reverse();

                res.status(200).json({ feed: userFeed });
        } catch (error) {
                res.status(500).json({ message: error.message });
        }
};

const createChain = async (req, res) => {
        try {
                const { email, description, nominated, random } = req.body;

                const chainsPath = path.join(__dirname, '..', 'database', 'chains.json');
                const eventsPath = path.join(__dirname, '..', 'database', 'events.json');
                const usersPath = path.join(__dirname, '..', 'database', 'users.json');

                const chainsData = await fs.readFile(chainsPath, 'utf-8');
                const eventsData = await fs.readFile(eventsPath, 'utf-8');
                const usersData = await fs.readFile(usersPath, 'utf-8');

                const chains = JSON.parse(chainsData);
                const events = JSON.parse(eventsData);
                const users = JSON.parse(usersData);

                let selectedNominated = nominated;
                if (random) {
                        const randomUsers = users.filter(user => user.random === true);
                        if (randomUsers.length > 0) {
                                const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
                                selectedNominated = randomUser.email;
                        }
                }

                const newChainId = chains.length ? chains[chains.length - 1].id + 1 : 1;
                const newChain = {
                        id: newChainId,
                        users: [email]
                };
                chains.push(newChain);

                const newEventId = events.length ? events[events.length - 1].id + 1 : 1;
                const newEvent = {
                        id: newEventId,
                        description,
                        chain: newChainId,
                        link: 1,
                        user: email,
                        nominated: selectedNominated,
                        nominationCompleted: false
                };
                events.push(newEvent);

                await fs.writeFile(chainsPath, JSON.stringify(chains, null, 2), 'utf-8');
                await fs.writeFile(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

                res.status(201).json({ message: 'Chain created successfully.', chain: newChain, event: newEvent });
        } catch (error) {
                res.status(500).json({ message: error.message });
        }
};

const joinChain = async (req, res) => {
        try {
                const { email, chainId, description, nominated, eventId, random } = req.body;

                const chainsPath = path.join(__dirname, '..', 'database', 'chains.json');
                const eventsPath = path.join(__dirname, '..', 'database', 'events.json');
                const usersPath = path.join(__dirname, '..', 'database', 'users.json');

                const chainsData = await fs.readFile(chainsPath, 'utf-8');
                const eventsData = await fs.readFile(eventsPath, 'utf-8');
                const usersData = await fs.readFile(usersPath, 'utf-8');

                const chains = JSON.parse(chainsData);
                const events = JSON.parse(eventsData);
                const users = JSON.parse(usersData);

                const chain = chains.find(c => c.id === chainId);

                chain.users.push(email);

                const existingEvent = events.find(event => event.id === eventId);
                existingEvent.nominationCompleted = true;

                let selectedNominated = nominated;
                if (random) {
                        const randomUsers = users.filter(user => user.random === true);
                        if (randomUsers.length > 0) {
                                const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
                                selectedNominated = randomUser.email;
                        }
                }

                const newEventId = events.length ? events[events.length - 1].id + 1 : 1;
                const newEvent = {
                        id: newEventId,
                        description,
                        chain: chainId,
                        link: chain.users.length,
                        user: email,
                        nominated: selectedNominated,
                        nominationCompleted: false
                };
                events.push(newEvent);

                await fs.writeFile(chainsPath, JSON.stringify(chains, null, 2), 'utf-8');
                await fs.writeFile(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

                res.status(200).json({ message: 'User joined the chain successfully.', chain, event: newEvent });
        } catch (error) {
                res.status(500).json({ message: error.message });
        }
};

const getNominations = async (req, res) => {
        try {
                const { email } = req.query;

                const eventsPath = path.join(__dirname, '..', 'database', 'events.json');
                const usersPath = path.join(__dirname, '..', 'database', 'users.json');

                const eventsData = await fs.readFile(eventsPath, 'utf-8');
                const usersData = await fs.readFile(usersPath, 'utf-8');

                const events = JSON.parse(eventsData);
                const users = JSON.parse(usersData);

                const getNameByEmail = (email) => {
                        const user = users.find(u => u.email === email);
                        return user ? user.name : null;
                };

                const nominations = events
                        .filter(event => event.nominated === email && event.nominationCompleted === false)
                        .map(event => ({
                                ...event,
                                userName: getNameByEmail(event.user)
                        }));

                res.status(200).json({ nominations });
        } catch (error) {
                res.status(500).json({ message: error.message });
        }
};

const register = async (req, res) => {
        try {
                const { name, email, password, random } = req.body;

                const filePath = path.join(__dirname, '..', 'database', 'users.json');
                const data = await fs.readFile(filePath, 'utf-8');
                const users = JSON.parse(data);

                const userExists = users.some((user) => user.email === email);

                if (userExists) {
                        return res.status(400).json({ message: 'User already exists.' });
                }

                const newUser = {
                        name,
                        email,
                        password,
                        following: [email],
                        random
                };

                users.push(newUser);

                await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf-8');

                res.status(201).json({ message: 'Registration successful.' });
        } catch (error) {
                res.status(500).json({ message: error.message });
        }
};

const generateIdea = async (req, res) => {
        const genAI = new GoogleGenerativeAI("AIzaSyDCwveuzED9nr9U4aJ3p2RzNaeE366NvFM");
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const generateContent = async (prompt) => {
                try {
                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        console.log('Generated Content:', response.text());
                        return response.text();
                } catch (error) {
                        console.error('Error generating content:', error);
                        return "Erorr generating content";
                }

        };

        const prompt = 'Give me a (serious) good deed to do in less than 8 words. No other text. Nothing about blood.';
        const message = await generateContent(prompt);

        res.status(200).json({ message });
};


module.exports = {
        login,
        getFeed,
        createChain,
        joinChain,
        getNominations,
        register,
        generateIdea
}