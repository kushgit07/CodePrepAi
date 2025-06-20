const JUDGE0_CONFIG = {
    rapidApiKey: process.env.JUDGE0_RAPID_API_KEY,
    baseURL: 'https://judge0-ce.p.rapidapi.com',
    headers: {
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': process.env.JUDGE0_RAPID_API_KEY,
        'Content-Type': 'application/json'
    }
};

module.exports = JUDGE0_CONFIG; 