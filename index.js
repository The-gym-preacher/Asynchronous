
const API = "https://api.github.com/users/Preacher-Y";

async function handlePromise() {
    try {
        const data = await fetch(API);
        const results = await data.json();

        const repos = await fetch(results.repos_url);
        const reposResults = await repos.json();

        const names = reposResults.map(repo => `
            <div class="bg-white shadow-md p-4 rounded-lg text-left">
                <p><strong>Name:</strong> <span class="text-gray-600">${repo.name}</span></p>
                <p><strong>Link:</strong> <a class="text-blue-500 underline" href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
            </div>
        `);

        document.getElementById("text").innerHTML = `
            <h2 class="text-2xl font-semibold text-green-700 mb-4">GitHub User: ${results.login}</h2>
            <div class="space-y-4">${names.join("")}</div>
        `;

        console.log(`The Promise resolved with status: ${data.status}`);
    } catch (error) {
        document.getElementById("text").innerHTML = `<p class="text-red-600">Failed to load data. Please try again later.</p>`;
        console.error("Error fetching GitHub data:", error);
    }
}

handlePromise();

