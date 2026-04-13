//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  searchTopic(allEpisodes);
  updateCount(allEpisodes.length, allEpisodes.length);

  fillSelector(allEpisodes);
  setupSelector(allEpisodes);
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
    image.src = episodes.image.medium;
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

  searchInput.addEventListener('input', (event) => {
    searchTerm = event.target.value.toLowerCase();

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
function updateCount(found, total){
  const countDisplay = document.getElementById('count-info');
  if(countDisplay ){
    countDisplay.textContent = `Displaying ${found}/${total} episodes`;
  }
}

function fillSelector(allEpisodes){
  const selector = document.getElementById('episodes-menu');

  allEpisodes.forEach((episode) => {
    const option = document.createElement('option');
    option.value = episode.id

    option.textContent = `${makeSeasonAndEpisodes(episode)} - ${episode.name}`;
    selector.appendChild(option)
  })
}

function setupSelector(allEpisodes){
  const selector = document.getElementById('episodes-menu');

  selector.addEventListener('change', (event) => {
    const selectId = event.target.value;

    if(selectId === 'all'){
      makePageForEpisodes(allEpisodes);
      updateCount(allEpisodes.length, allEpisodes.length);
    }else { 
      //find the episode with the matching id and display it
      const selectEpisode = allEpisodes.filter(episode => episode.id == selectId)
      makePageForEpisodes(selectEpisode);
      updateCount(selectEpisode.length, allEpisodes.length);
    }

  })

}


window.onload = setup;


