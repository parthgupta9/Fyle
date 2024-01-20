let currentPage = 1;
const perPageSelect = document.getElementById('perPage');
const searchInput = document.getElementById('searchQuery');
const repositoriesList = document.getElementById('repositories-list');
const paginationContainer = document.getElementById('pagination');

async function fetchRepositories() {
    const username = document.getElementById('username').value;
    const perPage = perPageSelect.value;
    const searchQuery = searchInput.value;

    repositoriesList.innerHTML = '';
    paginationContainer.innerHTML = '';

    try {
        if (!username) {
            throw new Error('Please enter a GitHub username.');
        }

        let apiUrl = `https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${perPage}`;

        if (searchQuery) {
            apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
        }
        console.log('API URL:', apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        if (data.length === 0) {
            repositoriesList.textContent = 'No repositories found.';
        } else {
for (const repo of data) {
    try {
        const repoLink = document.createElement('a');
        repoLink.href = repo.html_url;
        repoLink.textContent = repo.name;
        repoLink.target = '_blank';

        const listItem = document.createElement('div');
        listItem.classList.add('repo-item');
        listItem.appendChild(repoLink);


        const topicsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/topics`, {
            headers: {
                Accept: 'application/vnd.github.mercy-preview+json', // Include this header for topics API
            },
        });


        const languagesResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`);

        if (topicsResponse.ok && languagesResponse.ok) {
            const topicsData = await topicsResponse.json();
            const languagesData = await languagesResponse.json();

            console.log('Repo:', repo.name);
            console.log('Topics:', topicsData.names);
            console.log('Languages:', Object.keys(languagesData));

            const infoContainer = document.createElement('div');
            infoContainer.classList.add('info-container');


            if (topicsData.names.length > 0) {
                const topicsContainer = document.createElement('div');
                topicsContainer.classList.add('topics');
                const topics = topicsData.names.map(topic => `<span class="topic">${topic}</span>`).join('');
                topicsContainer.innerHTML = `<strong>Topics:</strong> ${topics}`;
                infoContainer.appendChild(topicsContainer);
            }
     const languagesContainer = document.createElement('div');
            languagesContainer.classList.add('languages');
            const languages = Object.keys(languagesData).map(language => `<span class="language  ">${language}</span>`).join('');
            languagesContainer.innerHTML = `<strong>Languages:</strong> ${languages}`;
            infoContainer.appendChild(languagesContainer);

            listItem.appendChild(infoContainer);
            repositoriesList.appendChild(listItem);
        } else {
            console.warn(`Error fetching data for ${repo.name}: Topics - ${topicsResponse.status} - ${topicsResponse.statusText}, Languages - ${languagesResponse.status} - ${languagesResponse.statusText}`);
        }
    } catch (error) {
        console.error('An error occurred while fetching data:', error.message);
        repositoriesList.textContent = `Error: ${error.message}`;

    }
}

   
            if (response.headers.has('Link')) {
                const linkHeader = response.headers.get('Link');
                const match = linkHeader.match(/page=(\d+)&per_page=(\d+)>; rel="last"/);
                const totalRepos = match ? match[1] : 1;
                createPagination(totalRepos, perPage);
            }
        }
    } catch (error) {
        console.error('An error occurred while fetching data:', error.message);
        repositoriesList.textContent = `Error: ${error.message}`;
    }
}

function createPagination(totalPages, perPage) {
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            fetchRepositories();
        });
        paginationContainer.appendChild(pageButton);
    }
}

fetchRepositories();
