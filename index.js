const input = document.getElementById("input");
const textDiv = document.getElementById("text");
const loader = document.getElementById("loader");
const searchContainer = document.querySelector(".relative.group");
const username = 'Preacher-Y'; // Set your GitHub username here
let allRepos = []; // Store all repositories for filtering
let userData = null; // Store user data
let controller = null;

// Fetch repositories on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchAllRepos();
});

// Add search functionality for filtering repos
input.addEventListener("input", () => {
    const searchQuery = input.value.trim().toLowerCase();
    if (allRepos.length > 0) {
        filterRepos(searchQuery);
    }
});

// Keep search expanded when input is focused
input.addEventListener("focus", () => {
    searchContainer.classList.add("search-active");
});

// Add some custom CSS for better search experience
const style = document.createElement('style');
style.textContent = `
    .search-active {
        width: 300px !important;
    }
    .search-active input {
        display: block !important;
    }
    .search-active svg {
        background-color: #2563eb !important;
        color: white !important;
    }
    @media (max-width: 768px) {
        .search-active {
            width: 250px !important;
        }
    }
`;
document.head.appendChild(style);

async function fetchAllRepos() {
    showLoader();
    
    // Cancel previous request if any
    if (controller) {
        controller.abort();
    }
    
    controller = new AbortController();
    const signal = controller.signal;
    
    try {
        // Fetch user data
        const userResponse = await fetch(`https://api.github.com/users/${username}`, { signal });
        
        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                throw new Error("User not found");
            } else if (userResponse.status === 403) {
                throw new Error("API rate limit exceeded");
            } else {
                throw new Error(`HTTP error! status: ${userResponse.status}`);
            }
        }
        
        userData = await userResponse.json();
        
        // Fetch repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { signal });
        
        if (!reposResponse.ok) {
            throw new Error(`Failed to fetch repositories: ${reposResponse.status}`);
        }
        
        const reposData = await reposResponse.json();
        
        // Store all repos for filtering
        allRepos = reposData;
        
        // Check if user has any repositories
        if (!reposData || reposData.length === 0) {
            textDiv.innerHTML = `
                <div class="text-center py-8">
                    <h2 class="text-2xl font-semibold text-green-700 mb-4">GitHub User: ${userData.login}</h2>
                    <p class="text-gray-600">No repositories found for this user.</p>
                </div>
            `;
            return;
        }
        
        // Display all repositories initially
        displayRepos(reposData);
        
        // Update placeholder text to indicate search is ready
        input.placeholder = `Search through ${reposData.length} repositories...`;
        
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error("Fetch error:", err);
            textDiv.innerHTML = `
                <div class="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                    <div class="flex items-center mb-3">
                        <svg class="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-red-700 font-semibold">Error Loading Repositories</p>
                    </div>
                    <p class="text-red-600 text-sm">${err.message}</p>
                    <button onclick="fetchAllRepos()" class="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                        Try Again
                    </button>
                </div>
            `;
        }
    } finally {
        hideLoader();
    }
}

function filterRepos(searchQuery) {
    if (!allRepos.length) return;
    
    // Filter repositories based on search query
    const filteredRepos = allRepos.filter(repo => 
        repo.name.toLowerCase().includes(searchQuery) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery)) ||
        (repo.language && repo.language.toLowerCase().includes(searchQuery)) ||
        (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(searchQuery)))
    );
    
    // Display filtered results
    displayRepos(filteredRepos, searchQuery);
}

function displayRepos(repos, searchQuery = '') {
    // Generate HTML for repositories
    const reposHTML = repos.map(repo => `
        <div class="bg-white shadow-lg hover:shadow-xl p-6 hover:-translate-y-1 transition-all duration-300 rounded-xl border border-gray-100">
            <div class="mb-4">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                        ${highlightText(repo.name, searchQuery)}
                    </h3>
                    ${repo.private ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Private</span>' : '<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Public</span>'}
                </div>
                ${repo.description ? `<p class="text-gray-600 text-sm leading-relaxed">${highlightText(repo.description, searchQuery)}</p>` : '<p class="text-gray-400 text-sm italic">No description available</p>'}
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div class="flex items-center">
                    <span class="font-medium text-gray-700">Language:</span>
                    <span class="ml-2 text-gray-600">${repo.language ? highlightText(repo.language, searchQuery) : 'Not specified'}</span>
                </div>
                <div class="flex items-center">
                    <span class="font-medium text-gray-700">Updated:</span>
                    <span class="ml-2 text-gray-600">${new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
            </div>
            
            <div class="flex items-center space-x-2 justify-between">
                <div class="flex space-x-4 text-sm text-gray-600">
                    <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        ${repo.stargazers_count}
                    </span>
                    <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7l3.707-3.707a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        ${repo.forks_count}
                    </span>
                </div>
                
                <div class="flex space-x-2">
                    <a href="${repo.html_url}" target="_blank" 
                       class="px-4 py-2 bg-blue-500 self-center hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
                        View
                    </a>
                    <a href="${repo.clone_url}" target="_blank" 
                       class="px-4 py-2 bg-gray-500 self-center hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                        Clone
                    </a>
                </div>
            </div>
        </div>
    `).join("");
    
    // Show search results info
    const searchInfo = searchQuery ? 
        `<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p class="text-blue-800 font-medium">🔍 Found ${repos.length} repositories matching "${searchQuery}"</p>
            ${repos.length !== allRepos.length ? `<p class="text-blue-600 text-sm mt-1">Showing ${repos.length} of ${allRepos.length} total repositories</p>` : ''}
        </div>` : '';
    
    // Display user info and repositories
    textDiv.innerHTML = `
        <div class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div class="flex flex-col md:flex-row items-center gap-6">
                <img src="${userData.avatar_url}" alt="${userData.login}" class="w-20 h-20 rounded-full shadow-lg">
                <div class="text-center md:text-left">
                    <h2 class="text-3xl font-bold text-blue-800">${userData.name || userData.login}</h2>
                    <p class="text-blue-600 text-lg">@${userData.login}</p>
                    ${userData.bio ? `<p class="text-gray-700 mt-2 max-w-md">${userData.bio}</p>` : ''}
                    <div class="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-gray-600">
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                            </svg>
                            ${userData.location || 'Location not specified'}
                        </span>
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            ${allRepos.length} repositories
                        </span>
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                            </svg>
                            ${userData.followers || 0} followers
                        </span>
                    </div>
                </div>
            </div>
        </div>
        
        ${searchInfo}
        
        ${repos.length > 0 ? 
            `<div class="grid gap-6 xl:grid-cols-2">${reposHTML}</div>` :
            `<div class="text-center p-12 bg-gray-50 rounded-2xl">
                <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.746-6.26-2.016a7.962 7.962 0 010-5.968A7.962 7.962 0 0112 5c2.34 0 4.5.746 6.26 2.016a7.962 7.962 0 010 5.968z"/>
                </svg>
                <p class="text-gray-600 text-lg">No repositories found matching "${searchQuery}"</p>
                <p class="text-gray-500 text-sm mt-2">Try searching with different keywords</p>
                <button onclick="clearSearch()" class="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Show All Repositories
                </button>
            </div>`
        }
    `;
}

function highlightText(text, searchQuery) {
    if (!searchQuery || !text) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}

function clearSearch() {
    input.value = '';
    displayRepos(allRepos);
}

function showLoader() {
    loader.style.display = "flex";
}

function hideLoader() {
    loader.style.display = "none";
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Focus search input when pressing '/' key
    if (e.key === '/' && e.target !== input) {
        e.preventDefault();
        searchContainer.classList.add("search-active");
        input.focus();
    }
    
    // Clear search when pressing Escape
    if (e.key === 'Escape' && e.target === input) {
        clearSearch();
        input.blur();
        searchContainer.classList.remove("search-active");
    }
});

// Handle clicking outside search to collapse it
document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target) && !input.value.trim()) {
        searchContainer.classList.remove("search-active");
    }
});

// Make clearSearch function globally available
window.clearSearch = clearSearch;
