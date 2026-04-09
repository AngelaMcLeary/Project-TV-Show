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

  episodeList.forEach((episodes) => {
    const seasonTitle = document.createElement("h2");
    seasonTitle.textContent = `${makeSeasonAndEpisodes(episodes)}: ${episodes.name}`;
    rootElem.appendChild(seasonTitle);

    const image = document.createElement("img");
    image.src = episodes.image.medium;
    rootElem.appendChild(image);

    const summary = document.createElement ("summary")
    summary.innerHTML = episodes.summary;
    rootElem.appendChild(summary)
  });
}
window.onload = setup;
