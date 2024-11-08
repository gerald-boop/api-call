const monsterResult = document.getElementById("monsterResult");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

let currentPage = 1;
const pageSize = 20;
let monstersList = []; // Store list of monsters for easy access
let currentMonsterIndex = -1; // Track the index of the currently viewed monster (-1 when on list view)

// Fetch a paginated list of monsters
function fetchMonsters(page) {
  monsterResult.innerHTML = "Loading monsters...";
  axios
    .get(`https://www.dnd5eapi.co/api/monsters?limit=${pageSize}&offset=${(page - 1) * pageSize}`)
    .then((response) => {
      monstersList = response.data.results || [];
      displayMonsters(monstersList);
      prevButton.disabled = true; // Disable "Previous" when viewing the list
      nextButton.disabled = false; // Enable "Next" to view a random monster
    })
    .catch((error) => {
      console.error("Error fetching monster list:", error);
      monsterResult.innerHTML = "Error fetching monster list.";
    });
}

// Display the list of monsters and set up click events for each row
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

  // Set up click events for each row
  document.querySelectorAll(".monster-row").forEach((row) => {
    row.addEventListener("click", (event) => {
      const index = parseInt(event.currentTarget.getAttribute("data-index"));
      viewMonsterDetails(index);
    });
  });
}

// View details for a specific monster and set up buttons
function viewMonsterDetails(index) {
  currentMonsterIndex = index;
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

      // Enable Previous button to go back to the list view
      prevButton.disabled = false;
      // Enable or disable Next button based on position in the list
      nextButton.disabled = currentMonsterIndex >= monstersList.length - 1;
    })
    .catch((error) => {
      console.error("Error fetching monster details:", error);
      monsterResult.innerHTML = "Error fetching monster details.";
    });
}

// Event listener for the Previous button
prevButton.addEventListener("click", () => {
  if (currentMonsterIndex === -1) {
    // Already in list view, no action needed
    return;
  }

  // Return to the list view
  displayMonsters(monstersList);
  currentMonsterIndex = -1; // Reset to indicate we're in list view
  prevButton.disabled = true; // Disable Previous button in list view
  nextButton.disabled = false; // Enable Next for random monster
});

// Event listener for the Next button
nextButton.addEventListener("click", () => {
  if (currentMonsterIndex === -1) {
    // If in list view, show a random monster
    const randomIndex = Math.floor(Math.random() * monstersList.length);
    viewMonsterDetails(randomIndex);
  } else if (currentMonsterIndex < monstersList.length - 1) {
    // Show the next monster in the list
    viewMonsterDetails(currentMonsterIndex + 1);
  }
});

// Initial call to fetch and display monsters
fetchMonsters(currentPage);
