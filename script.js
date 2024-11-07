const monsterInput = document.getElementById("monsterInput");
const searchButton = document.getElementById("searchButton");
const monsterResult = document.getElementById("monsterResult");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

let currentPage = 1; // Tracks the current page for pagination
const pageSize = 20; // Number of monsters per page

searchButton.addEventListener("click", () => {
  const monsterName = monsterInput.value.toLowerCase();
  if (monsterName) {
    searchMonster(monsterName);
  } else {
    fetchMonsters(currentPage); // Fetch monsters for the current page if no name is entered
  }
});

// Fetch a list of monsters with pagination
function fetchMonsters(page) {
  monsterResult.innerHTML = "Loading monsters...";
  axios
    .get(`https://www.dnd5eapi.co/api/monsters?limit=${pageSize}&offset=${(page - 1) * pageSize}`)
    .then((response) => {
      displayMonsters(response.data.results);
      managePaginationButtons(response.data.count);
    })
    .catch((error) => {
      monsterResult.innerHTML = "Error fetching monster list.";
    });
}

// Display the list of monsters in a table format
function displayMonsters(monsters) {
  if (monsters.length === 0) {
    monsterResult.innerHTML = "No monsters found.";
    return;
  }

  // Start creating the HTML for the table
  let tableHTML = "<h2>Monsters List</h2><table><thead><tr><th>Name</th><th>Type</th><th>Challenge Rating</th></tr></thead><tbody>";
  
  tableHTML += monsters
    .map(
      (monster) =>
        `<tr onclick="fetchMonsterDetails('${monster.index}')">
          <td>${monster.name}</td>
          <td>${monster.type}</td>
          <td>${monster.challenge_rating || 'N/A'}</td>
        </tr>`
    )
    .join("");

  tableHTML += "</tbody></table>";
  monsterResult.innerHTML = tableHTML;
}

// Fetch and display details of a specific monster
function fetchMonsterDetails(monsterIndex) {
  monsterResult.innerHTML = "Fetching monster details...";
  axios
    .get(`https://www.dnd5eapi.co/api/monsters/${monsterIndex}`)
    .then((response) => {
      const monsterData = response.data;
      monsterResult.innerHTML = `
        <h2>${monsterData.name}</h2>
        <p><strong>Type:</strong> ${monsterData.type}</p>
        <p><strong>Alignment:</strong> ${monsterData.alignment}</p>
        <p><strong>Armor Class:</strong> ${monsterData.armor_class}</p>
        <p><strong>Hit Points:</strong> ${monsterData.hit_points}</p>
        <p><strong>Challenge Rating:</strong> ${monsterData.challenge_rating}</p>
        <!-- Display more details if desired -->
      `;
    })
    .catch((error) => {
      monsterResult.innerHTML = "Error fetching monster details.";
    });
}

// Search for a monster by name
function searchMonster(monsterName) {
  monsterResult.innerHTML = "Searching...";
  axios
    .get(`https://www.dnd5eapi.co/api/monsters`)
    .then((response) => {
      const monsters = response.data.results;
      const matchedMonster = monsters.find(
        (monster) => monster.name.toLowerCase() === monsterName
      );

      if (matchedMonster) {
        fetchMonsterDetails(matchedMonster.index);
      } else {
        monsterResult.innerHTML = "Monster not found.";
      }
    })
    .catch((error) => {
      monsterResult.innerHTML = "Error fetching monsters.";
    });
}

// Manage pagination button states based on the current page and total items
function managePaginationButtons(totalItems) {
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage * pageSize >= totalItems;
}

// Event listeners for pagination buttons
prevButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchMonsters(currentPage);
  }
});

nextButton.addEventListener("click", () => {
  currentPage++;
  fetchMonsters(currentPage);
});

// Initial fetch on page load
fetchMonsters(currentPage);
