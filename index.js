const input = document.getElementById("input");
const textDiv = document.getElementById("text");
const loader = document.getElementById("loader");

let controller = null; // store AbortController instance

input.addEventListener("input", () => {
    const query = input.value.trim();

    // Cancel previous request
    if (controller) {
        controller.abort();
    }

    // Skip fetch if query is empty
    if (!query) {
        textDiv.innerHTML = "";
        return;
    }

    controller = new AbortController();
    const signal = controller.signal;

    searchRepos(query, signal);
});

async function searchRepos(username, signal) {
    textDiv.innerHTML = "";
    loader.style.display = "flex";

    try {
        const userResponse = await fetch(`https://api.github.com/users/${username}`, { signal });
        if (!userResponse.ok) throw new Error("User not found");

        const userData = await userResponse.json();

        const reposResponse = await fetch(userData.repos_url, { signal });
        const reposData = await reposResponse.json();

        const reposHTML = reposData.map(repo => `
            <div class="bg-white shadow-lg p-4 hover:-translate-y-2 transition-all duration-600 rounded-lg text-left">
                <p><strong>Name:</strong> <span class="text-gray-600">${repo.name}</span></p>
                <p><strong>Link:</strong> <a class="text-blue-500 underline" href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
            </div>
        `).join("");

        textDiv.innerHTML = `
            <h2 class="text-2xl font-semibold text-green-700 mb-4">GitHub User: ${userData.login}</h2>
            <div class="space-y-4">${reposHTML}</div>
        `;
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error("Fetch error:", err);
            textDiv.innerHTML = `<p class="text-red-600">Failed to load data. Try again or check the username.</p>`;
        }
    } finally {
        loader.style.display = "none";
    }
}
