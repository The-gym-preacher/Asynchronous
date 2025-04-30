const API = "https://api.github.com/users/Joconde-N";

setTimeout(() => {
    async function handlePromise() {
        const textDiv = document.getElementById("text");
        const loader = document.getElementById("loader");
    
        try {
            const data = await fetch(API);
            const results = await data.json();
            console.log(results);
            const repos = await fetch(results.repos_url);
            const reposResults = await repos.json();
            console.log(reposResults);
            const names = reposResults.map(repo => `
                <div class="bg-white shadow-lg p-4 hover:-translate-y-2 transition-all duration-600 rounded-lg text-left">
                    <p><strong>Name:</strong> <span class="text-gray-600">${repo.name}</span></p>
                    <p><strong>Link:</strong> <a class="text-blue-500 underline" href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
                </div>
            `);
    
            loader.style.display = "none"; // hide the loader
            textDiv.innerHTML += `
                <h2 class="text-2xl font-semibold text-green-700 mb-4">GitHub User: ${results.login}</h2>
                <div class="space-y-4">${names.join("")}</div>
            `;
    
            console.log(`The Promise resolved with status: ${data.status}`);
        } catch (error) {
            loader.style.display = "none";
            textDiv.innerHTML += `<p class="text-red-600">Failed to load data. Please try refreshing Or call the web owner.</p>`;
            console.error("Error fetching GitHub data:", error);
        }
    }
    handlePromise();
}, 3000);

