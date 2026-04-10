//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}
function makeSeasonAndEpisodes(episodes) {
  const {season, number} = episodes;
  const paddedSeason = season.toString().padStart(2, "0");
  const paddedEpisode = number.toString().padStart(2, "0");
  return `S${paddedSeason}E${paddedEpisode}`
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  //clear previous content
  rootElem.innerHTML = "";

  episodeList.forEach((episodes) => {
    //container for episodes
    const episodeCard = document.createElement("div");
    episodeCard.className = "episode-card";
    //season title
    const seasonTitle = document.createElement("h2");
    seasonTitle.textContent = `${episodes.name} ${makeSeasonAndEpisodes(episodes)}`;
    episodeCard.appendChild(seasonTitle);
    //image for season episode
    const image = document.createElement("img");
    image.src = episodes.image.medium;
    image.alt = episodes.name;
    episodeCard.appendChild(image);
    //summary for season episode
    const summary = document.createElement ("p")
    summary.className = "summary";
    summary.innerHTML = episodes.summary;
    episodeCard.appendChild(summary)
    //add card to page containing season, episode, summary and image
    rootElem.appendChild(episodeCard);
  });
}
window.onload = setup;
