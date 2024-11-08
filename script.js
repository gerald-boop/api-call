const monsterInput = document.getElementById("monsterInput");
const searchButton = document.getElementById("searchButton");
const monsterResult = document.getElementById("monsterResult");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

let currentPage = 1;
const pageSize = 20;
let monstersList = []; // Store the full list of monsters
let filteredMonsters = []; // Store filtered search results
let currentMonsterIndex = -1; // Index of the currently viewed monster in the full list
let inSearchMode = false; // Track if we are in search mode

// Fetch the full list of monsters
function fetchMonsters(page) {
    monsterResult.innerHTML = "Loading monsters...";
    axios
        .get(`https://www.dnd5eapi.co/api/monsters?limit=${pageSize}&offset=${(page - 1) * pageSize}`)
        .then((response) => {
            monstersList = response.data.results || [];
            displayMonsters(monstersList);
            resetButtonState(); // Set initial button states for list view
            inSearchMode = false; // Start in full list mode
        })
        .catch((error) => {
            console.error("Error fetching monster list:", error);
            monsterResult.innerHTML = "Error fetching monster list.";
        });
}

// Display a list of monsters in a table format
function displayMonsters(monsters) {
    if (monsters.length === 0) {
        monsterResult.innerHTML = "No monsters found.";
        return;
    }

    let tableHTML = "<h2>Monsters List</h2><table><thead><tr><th>Name</th><th>Type</th><th>Challenge Rating</th></tr></thead><tbody>";
    tableHTML += monsters
        .map(
            (monster, index) =>
                `<tr class="monster-row" data-index="${index}">
                    <td>${monster.name}</td>
                    <td>${monster.type}</td>
                    <td>${monster.challenge_rating || 'N/A'}</td>
                </tr>`
        )
        .join("");

    tableHTML += "</tbody></table>";
    monsterResult.innerHTML = tableHTML;

    // Set up click events for each row to view monster details
    document.querySelectorAll(".monster-row").forEach((row) => {
        row.addEventListener("click", (event) => {
            const indexInFiltered = parseInt(event.currentTarget.getAttribute("data-index"));
            const selectedMonster = filteredMonsters[indexInFiltered];
            const indexInFullList = monstersList.findIndex(
                (monster) => monster.index === selectedMonster.index
            );
            viewMonsterDetails(indexInFullList); // Use the index from the full list
        });
    });
}

// View details for a specific monster, navigating through the full list
function viewMonsterDetails(index) {
    currentMonsterIndex = index; // Track the index in the full list
    const monster = monstersList[currentMonsterIndex];
    monsterResult.innerHTML = "Loading details...";

    axios
        .get(`https://www.dnd5eapi.co/api/monsters/${monster.index}`)
        .then((response) => {
            const monsterData = response.data;
            monsterResult.innerHTML = `
                <h2>${monsterData.name}</h2>
                <p><strong>Type:</strong> ${monsterData.type}</p>
                <p><strong>Alignment:</strong> ${monsterData.alignment}</p>
                <p><strong>Armor Class:</strong> ${monsterData.armor_class}</p>
                <p><strong>Hit Points:</strong> ${monsterData.hit_points}</p>
                <p><strong>Challenge Rating:</strong> ${monsterData.challenge_rating}</p>
            `;

            // Set button states for detail view
            prevButton.disabled = false; // Enable "Previous" to go back to the list view
            nextButton.disabled = currentMonsterIndex >= monstersList.length - 1; // Disable "Next" if at the end of the full list
        })
        .catch((error) => {
            console.error("Error fetching monster details:", error);
            monsterResult.innerHTML = "Error fetching monster details.";
        });
}

// Reset button states for the list view
function resetButtonState() {
    currentMonsterIndex = -1; // Reset index for list view
    prevButton.disabled = true; // Disable "Previous" in list view
    nextButton.disabled = false; // Enable "Next" for a random monster view
}

// Event listener for the Previous button
prevButton.addEventListener("click", () => {
    if (currentMonsterIndex === -1) return; // Already in list view

    // Return to the full, unfiltered list view
    displayMonsters(monstersList);
    resetButtonState();
    inSearchMode = false; // Reset search mode
});

// Event listener for the Next button to go through the full list
nextButton.addEventListener("click", () => {
    if (currentMonsterIndex === -1) {
        // Show a random monster when in list view
        const randomIndex = Math.floor(Math.random() * monstersList.length);
        viewMonsterDetails(randomIndex);
    } else if (currentMonsterIndex < monstersList.length - 1) {
        // Show the next monster in the full list
        viewMonsterDetails(currentMonsterIndex + 1);
    }
});

// Search functionality to filter monsters
searchButton.addEventListener("click", () => {
    const searchTerm = monsterInput.value.toLowerCase().trim();
    inSearchMode = Boolean(searchTerm); // Set search mode if there's a term

    if (searchTerm) {
        // Filter monsters based on search term
        filteredMonsters = monstersList.filter(monster =>
            monster.name.toLowerCase().includes(searchTerm)
        );
        displayMonsters(filteredMonsters); // Show the filtered list
    } else {
        // Reset to the full list if no search term
        displayMonsters(monstersList); // Show the full list
    }

    resetButtonState(); // Set button states for list view
});

// Initial fetch to display monsters
fetchMonsters(currentPage);
