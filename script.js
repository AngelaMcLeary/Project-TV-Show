// Global cache to store episodes and avoid multiple fetches for the same show
const episodesCache = {};

/**
 * Fills the show selector dropdown with all available shows
 */
function fillShowsSelector(allShows) {
  const showMenu = document.getElementById('show-menu');
  // clear existing options except the first one
  showMenu.innerHTML = '<option value="" >select a Show...</option>';

  allShows.forEach((show) => {
    const option = document.createElement('option');
    option.value = show.id;
    option.textContent = show.name;
    showMenu.appendChild(option);
  });
}

/**
 * Encapsulates the logic to get episodes with Cache implementation
 */
async function fetchDisplayEpisodes(showId) {
  const rootElem = document.getElementById('root');

  // Check if the show is already in cache to save network requests
  if (episodesCache[showId]) {
    console.log(`Loading show ${showId} from cache...`);
    renderShowData(episodesCache[showId]);
    return;
  }

  rootElem.innerHTML = '<p>Loading episodes… please wait.</p>';

  try {
    console.log(`Fetching show ${showId} from API...`);
    const episodesResponse = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    const allEpisodes = await episodesResponse.json();

    // Store in cache for future use
    episodesCache[showId] = allEpisodes;

    renderShowData(allEpisodes);
  } catch (error) {
    rootElem.innerHTML = `<p style="color:red;">Failed to load episodes. Please try again later.</p>`;
    console.error('fetch error:', error);
  }
}

/**
 * Helper function to trigger all UI updates (page, search, count, and selectors)
 */
function renderShowData(episodes) {
  makePageForEpisodes(episodes);
  searchTopic(episodes);
  updateCount(episodes.length, episodes.length);
  fillSelector(episodes);
  setupSelector(episodes);
}

/**
 * Initial setup: fetches all shows, sorts them, and loads the default show
 */
async function setup() {
  const rootElem = document.getElementById('root');
  const showMenu = document.getElementById('show-menu');

  //clean state to avoid confusion while loading shows
  rootElem.innerHTML =
    '<div class="message-container"><h2>Select a show to begin...</h2></div>';

  try {
    // 1. Fetch all shows from TVMaze API
    const showsResponse = await fetch('https://api.tvmaze.com/shows');
    const allShows = await showsResponse.json();

    // sorting alphabetically all shows with case and accent insensitivity
    allShows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    // pass the shows to fill the selector with options
    fillShowsSelector(allShows);


    // Listener to change episodes when a new show is selected
    showMenu.addEventListener('change', (event) => {
      const selectedShowId = event.target.value;
      if (selectedShowId !== '') {
        fetchDisplayEpisodes(selectedShowId);
      } 
      ///this can do the button back for to show other shows instead a button to reset the page, but I think it is more intuitive to just select another show from the dropdown
      // else {
      //   // Return to empty state if "Select a Show" is picked again
      //   rootElem.innerHTML =
      //     '<div class="message-container"><h2>Select a show to begin...</h2></div>';
      //   const countDisplay = document.getElementById('count-info');
      //   if (countDisplay) countDisplay.style.display = 'none';
      // }
    });
  } catch (error) {
    // If they select the placeholder again, show the welcome message
    rootElem.innerHTML = `<p style="color:red;">Failed to load data. Please try again later.</p>`;
    console.error('Fetch error:', error);
  }
}

/**
 * Formats the season and episode number into a standard S01E01 format
 */
function makeSeasonAndEpisodes(episode) {
  const paddedSeason = episode.season.toString().padStart(2, '0');
  const paddedEpisode = episode.number.toString().padStart(2, '0');
  return `S${paddedSeason}E${paddedEpisode}`;
}

// make the page for the shows
function makePageForShows(allShows) {
  const root = document.getElementById('root');
  root.innerHTML = "";

  allShows.forEach((show) => {
    const showCard = document.createElement('div');
    showCard.className = 'show-card';

    const image = document.createElement('img');
    image.src = show ? show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image';
    image.alt = show.name;
    showCard.appendChild(image);

    const title = document.createElement('h2');
    title.textContent = show.name;
    showCard.appendChild(title);

    const summary = document.createElement('p');
    genres.innerHTML = `<strong>Genres:</strong> ${show.genres.join(', ') || 'N/A'}`;
    showCard.appendChild(genres);

    const status = document.createElement('p');
    status.innerHTML = `<strong>Status:</strong> ${show.status || 'N/A'}`;
    showCard.appendChild(status);

    const rating = document.createElement('p');
    const ratingValue = show.rating && show.rating.average ? show.rating.average : 'N/A';
    rating.innerHTML = `<strong>Rating:</strong> ${ratingValue}`;
    showCard.appendChild(rating);

    const runtime = document.createElement('p');
    runtime.innerHTML = `<strong>Runtime:</strong> ${show.runtime ? show.runtime + ' min' : 'N/A'}`; 
  
    root.appendChild(showCard);
  }
)}

/**
 * Creates and appends episode cards to the DOM
 */
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById('root');
  // clear previous content before rendering new episodes
  rootElem.innerHTML = '';

  episodeList.forEach((episode) => {
    // container for episodes
    const episodeCard = document.createElement('div');
    episodeCard.className = 'episode-card';

    // season title
    const seasonTitle = document.createElement('h2');
    seasonTitle.textContent = `${episode.name} - ${makeSeasonAndEpisodes(
      episode
    )}`;ht
    episodeCard.appendChild(seasonTitle);

    // image for season episode
    const image = document.createElement('img');
    image.src = episode.image
      ? episode.image.medium
      : "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";
    image.alt = episode.name;
    episodeCard.appendChild(image);

    // summary for season episode
    const summary = document.createElement('p');
    summary.className = 'summary';
    summary.innerHTML = episode.summary || 'No summary available';
    episodeCard.appendChild(summary);

    // add card to page containing season, episode, summary and image
    rootElem.appendChild(episodeCard);
  });
}

// ---------- Search bar ---------

/**
 * Sets up the search functionality and handles live filtering
 */
function searchTopic(allEpisodes) {
  const searchInput = document.getElementById('search');

  // Point 4: Clear old listeners by cloning the element
  const newSearchInput = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newSearchInput, searchInput);

  newSearchInput.value = '';

  newSearchInput.addEventListener('input', (event) => {
    // reset episode selector every time user types in search
    const episodeMenu = document.getElementById('episodes-menu');
    if (episodeMenu) episodeMenu.value = 'all';

    const searchTerm = event.target.value.toLowerCase();

    // filter episodes based on name or summary match
    const filterEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(searchTerm);
      const summaryMatch = (episode.summary || '')
        .toLowerCase()
        .includes(searchTerm);
      return nameMatch || summaryMatch;
    });

    updateCount(filterEpisodes.length, allEpisodes.length);
    makePageForEpisodes(filterEpisodes);
  });
}

// ------- displaySearchCount ------

/**
 * Updates the text showing how many episodes are currently displayed
 * and handles the visibility of the counter
 */
function updateCount(found, total) {
  const countDisplay = document.getElementById('count-info');
  if (countDisplay) {
    // When this function runs, we make the element visible
    countDisplay.style.display = 'inline'; 
    countDisplay.textContent = `Displaying ${found}/${total} episodes`;
  }
}

/**
 * Populates the episode selector dropdown. 
 * If no episodes are provided, it shows a placeholder.
 */
function fillSelector(allEpisodes) {
  const selector = document.getElementById('episodes-menu');
  // clear selector before adding new options
  selector.innerHTML = '';


  if (!allEpisodes || allEpisodes.length === 0) {
    const option = document.createElement('option');
    option.textContent = 'Wait for a show...';
    selector.appendChild(option);
    return;
  }

  // add "Show all episodes" default option
  const defaultOption = document.createElement('option');
  defaultOption.value = 'all';
  defaultOption.textContent = 'Show all episodes';
  selector.appendChild(defaultOption);

  // add specific episode options
  allEpisodes.forEach((episode) => {
    const option = document.createElement('option');
    option.value = episode.id;
    option.textContent = `${makeSeasonAndEpisodes(episode)} - ${episode.name}`;
    selector.appendChild(option);
  });
}

/**
 * Sets up the change listener for the episode selector dropdown
 */
function setupSelector(allEpisodes) {
  const selector = document.getElementById('episodes-menu');

  // Point 4: Clear old listeners by cloning
  const newSelector = selector.cloneNode(true);
  selector.parentNode.replaceChild(newSelector, selector);

  newSelector.addEventListener('change', (event) => {
    const selectId = event.target.value;

    // clear search input when an episode is selected from dropdown
    const currentSearchInput = document.getElementById('search');
    if (currentSearchInput) currentSearchInput.value = '';

    if (selectId === 'all') {
      makePageForEpisodes(allEpisodes);
      updateCount(allEpisodes.length, allEpisodes.length);
    } else {
      // find the episode with the matching id and display it
      const selectEpisode = allEpisodes.filter(
        (episode) => episode.id == selectId
      );
      makePageForEpisodes(selectEpisode);
      updateCount(selectEpisode.length, allEpisodes.length);
    }
  });
}

// Initialize the application on window load
window.onload = setup;
