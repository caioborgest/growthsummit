import axios from 'axios';

async function searchGithub() {
    try {
        const query = encodeURIComponent('"matls-clients.api.cora.com.br" webhook');
        const res = await axios.get(`https://api.github.com/search/code?q=${query}`, {
            headers: { 'User-Agent': 'Node-Search' }
        });
        
        console.log(`Found ${res.data.total_count} results.`);
        for (const item of res.data.items) {
            console.log(item.html_url);
        }
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
searchGithub();
