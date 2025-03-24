







const fs = require('fs');
const axios = require('axios');

const API_URL = 'http://35.200.185.69:8000/v2/autocomplete';
const DELAY = 1220; // Slightly more than 1200ms for 50 requests per minute
const ALLOWED_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
const MAX_RESULTS = 12; // Maximum number of results per response

let s1 = '0';
let s2 = '\0'; // Using null character to indicate nothing has been inserted yet
let totalRequests = 0;
let totalDistinctStrings = 0;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function incrementString(str) {
    let chars = str.split('');
    for (let i = chars.length - 1; i >= 0; i--) {
        let index = ALLOWED_CHARS.indexOf(chars[i]);
        if (index < ALLOWED_CHARS.length - 1) {
            chars[i] = ALLOWED_CHARS[index + 1];
            return chars.slice(0, i + 1).join('');
        }
    }
    return null; // Out of bounds
}

async function fetchAutocomplete(query) {
    totalRequests++;
    try {
        const response = await axios.get(`${API_URL}?query=${query}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log(`Rate limited. Response: ${JSON.stringify(error.response.data)}. Waiting before retrying...`);
            await sleep(60000); // Wait for 1 minute before retrying
            return fetchAutocomplete(query);
        }
        throw error;
    }
}

async function processResults(response) {
    let newStrings = 0;
    for (let result of response.results) {
        if (result > s2) {
            fs.appendFileSync('v2_names.txt', result + '\n');
            s2 = result;
            newStrings++;
            totalDistinctStrings++;
        }
    }
    return newStrings;
}

async function main() {
    while (s1 !== null) {
        await sleep(DELAY);
        try {
            const response = await fetchAutocomplete(s1);
            const newStrings = await processResults(response);
            
            console.log(`Request #${totalRequests}: Query: ${s1}, Fetched: ${response.results.length}, New: ${newStrings}`);

            if (response.results.length < MAX_RESULTS) {
                s2 = '\0';
                s1 = incrementString(s1);
            } else {
                s1 = response.results[MAX_RESULTS - 1].substring(0, s1.length + 1);
            }
        } catch (error) {
            console.error('Error:', error.message);
            break;
        }
    }

    console.log(`Total requests made: ${totalRequests}`);
    console.log(`Total distinct strings fetched: ${totalDistinctStrings}`);
}

main();
