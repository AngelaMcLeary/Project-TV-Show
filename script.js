function fillShowsSelector(allShows) {
  const showMenu = document.getElementById('show-menu');

  // clear existing options except the first one
  showMenu.innerHTML = '<option value="" >select a Show...</option>?';

  allShows.forEach((show) => {
    const option = document.createElement('option');
    option.value = show.id;
    option.textContent = show.name;
    showMenu.appendChild(option);
  });
}

//update to call data to use API
async function setup() {
  const rootElem = document.getElementById('root');

  rootElem.innerHTML = '<p>Loading episodes… please wait.</p>';

  try {
    // 1. Fetch all shows
    const showsResponse = await fetch('https://api.tvmaze.com/shows');
    const allShows = await showsResponse.json();

    // sorting alphabetically all shows
    allShows.sort((a, b) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    );

    // Fill the selector
    fillShowsSelector(allShows);

    // Fetch episodes for the default show (ID 82)
    const episodesResponse = await fetch(
      'https://api.tvmaze.com/shows/82/episodes'
    );
    //update convert response to JSON
    const allEpisodes = await episodesResponse.json();

    // run logic logic as is
    makePageForEpisodes(allEpisodes);
    searchTopic(allEpisodes);
    updateCount(allEpisodes.length, allEpisodes.length);
    fillSelector(allEpisodes);
    setupSelector(allEpisodes);
  } catch (error) {
    //Inform the user visually on the page
    rootElem.innerHTML = `<p style="color:red;">Failed to load episodes. Please try again later.</p>`;

    // Log the technical error for you to debug
    console.error('Fetch error:', error);
  }
}

function makeSeasonAndEpisodes(episodes) {
  const { season, number } = episodes;
  const paddedSeason = season.toString().padStart(2, '0');
  const paddedEpisode = number.toString().padStart(2, '0');
  return `S${paddedSeason}E${paddedEpisode}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById('root');
  //clear previous content
  rootElem.innerHTML = '';

  episodeList.forEach((episodes) => {
    //container for episodes
    const episodeCard = document.createElement('div');
    episodeCard.className = 'episode-card';
    //season title
    const seasonTitle = document.createElement('h2');
    seasonTitle.textContent = `${episodes.name} ${makeSeasonAndEpisodes(
      episodes
    )}`;
    episodeCard.appendChild(seasonTitle);
    //image for season episode
    const image = document.createElement('img');
    image.src = episodes.image ? episodes.image.medium : ''; // Added safety check
    image.alt = episodes.name;
    episodeCard.appendChild(image);
    //summary for season episode
    const summary = document.createElement('p');
    summary.className = 'summary';
    summary.innerHTML = episodes.summary;
    episodeCard.appendChild(summary);
    //add card to page containing season, episode, summary and image
    rootElem.appendChild(episodeCard);
  });
}

// ---------- Search bar ---------
function searchTopic(allEpisodes) {
  const searchInput = document.getElementById('search');
  searchInput.value = '';
 
  searchInput.addEventListener('input', (event) => {
    // reset selector every time user types
    document.getElementById('episodes-menu').value = 'all';
    const searchTerm = event.target.value.toLowerCase();

    const filterEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(searchTerm);

      // to avoid null errors and convert summary to lowercase for comparison
      const summaryMatch = (episode.summary || '')
        .toLowerCase()
        .includes(searchTerm);
      return nameMatch || summaryMatch;
    });
    updateCount(filterEpisodes.length, allEpisodes.length);
    makePageForEpisodes(filterEpisodes);
  });
}

// -------displaySearchCount------
function updateCount(found, total) {
  const countDisplay = document.getElementById('count-info');
  if (countDisplay) {
    countDisplay.textContent = `Displaying ${found}/${total} episodes`;
  }
}

function fillSelector(allEpisodes) {
  const selector = document.getElementById('episodes-menu');
  //clear selector
  selector.innerHTML = '';

  // add show all episodes in option---->>>>
  const defaultOption = document.createElement('option');
  defaultOption.value = 'all';
  defaultOption.textContent = 'Show all episodes';
  selector.appendChild(defaultOption);

  // add episode options
  allEpisodes.forEach((episode) => {
    const option = document.createElement('option');
    option.value = episode.id;
    option.textContent = `${makeSeasonAndEpisodes(episode)} - ${episode.name}`;
    selector.appendChild(option);
  });
}

function setupSelector(allEpisodes) {
  const selector = document.getElementById('episodes-menu');

  selector.addEventListener('change', (event) => {
    const selectId = event.target.value;
    //clear search input
    const searchInput = document.getElementById('search');
    searchInput.value = '';

    if (selectId === 'all') {
      makePageForEpisodes(allEpisodes);
      updateCount(allEpisodes.length, allEpisodes.length);
    } else {
      //find the episode with the matching id and display it
      const selectEpisode = allEpisodes.filter(
        (episode) => episode.id == selectId
      );
      makePageForEpisodes(selectEpisode);
      updateCount(selectEpisode.length, allEpisodes.length);
    }
  });
}

window.onload = setup;
