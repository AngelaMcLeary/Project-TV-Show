const showDetailsCache = {};
const episodesCache = {};
let allShows = [];

window.onload = setup;

async function setup() {
  const rootElem = document.getElementById("root");
  const showMenu = document.getElementById("show-menu");

  try {
    const showsResponse = await fetch("https://api.tvmaze.com/shows");
    allShows = await showsResponse.json();

    allShows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );

    makePageForShows(allShows);
    fillShowsSelector(allShows);
    setupShowSearch(allShows);

    showMenu.addEventListener("change", (event) => {
      const selectedShowId = event.target.value;
      if (selectedShowId !== "") {
        fetchDisplayEpisodes(selectedShowId);
      }
    });
  } catch (error) {
    rootElem.innerHTML = `<p style="color:red;">Failed to load data. Please try again later.</p>`;
    console.error("Fetch error:", error);
  }
}

function setEpisodesBreadcrumb(show) {
  const breadcrumb = document.getElementById("breadcrumb");
  breadcrumb.innerHTML = `
    <span id="breadcrumb-home" class="breadcrumb-link">
      <img src="icons/home-icon-dark.png" alt="" class="home-icon">
      Home
    </span>
    <span class="breadcrumb-separator">&gt;</span>
    <span id="breadcrumb-shows" class="breadcrumb-link">Shows</span>
    <span class="breadcrumb-separator">&gt;</span>
    <span id="breadcrumb-show-name" class="breadcrumb-link">${show.name}</span>
    <span class="breadcrumb-separator">&gt;</span>
    <span class="breadcrumb-current">Episodes</span>
  `;

  document.getElementById("breadcrumb-home").addEventListener("click", () => {
    makePageForShows(allShows);
  });

  document.getElementById("breadcrumb-shows").addEventListener("click", () => {
    makePageForShows(allShows);
  });
}

function setShowsBreadcrumb() {
  const breadcrumb = document.getElementById("breadcrumb");
  breadcrumb.innerHTML = `
    <span id="breadcrumb-home" class="breadcrumb-link">
      <img src="icons/home-icon-dark.png" alt="" class="home-icon">
      Home
    </span>
    <span class="breadcrumb-separator">&gt;</span>
    <span id="breadcrumb-shows" class="breadcrumb-current">Shows</span>
  `;

  document.getElementById("breadcrumb-home").addEventListener("click", () => {
    makePageForShows(allShows);
    setShowsBreadcrumb();
  });
}

async function fetchDisplayEpisodes(showId) {
  const rootElem = document.getElementById("root");

  let show;
  if (showDetailsCache[showId]) {
    show = showDetailsCache[showId];
  } else {
    const showResponse = await fetch(`https://api.tvmaze.com/shows/${showId}`);
    show = await showResponse.json();
    showDetailsCache[showId] = show;
  }
  setEpisodesBreadcrumb(show);

  if (episodesCache[showId]) {
    renderShowData(episodesCache[showId]);
    return;
  }

  rootElem.innerHTML = "<p>Loading episodes… please wait.</p>";

  try {
    const episodesResponse = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );
    const allEpisodes = await episodesResponse.json();

    episodesCache[showId] = allEpisodes;

    renderShowData(allEpisodes);
  } catch (error) {
    rootElem.innerHTML = `<p style="color:red;">Failed to load episodes. Please try again later.</p>`;
    console.error("fetch error:", error);
  }
}

function makePageForShows(allShows) {
  setShowsBreadcrumb();
  showShowSearchUI();
  const countDisplay = document.getElementById("count-info");
  if (countDisplay) {
    countDisplay.textContent = `Displaying ${allShows.length} / ${allShows.length} shows`;
  }
  const showSearch = document.getElementById("show-search");
  if (showSearch) showSearch.value = "";

  const showMenu = document.getElementById("show-menu");
  if (showMenu) showMenu.value = "";

  const root = document.getElementById("root");
  root.innerHTML = "";

  allShows.forEach((show) => {
    const showCard = document.createElement("div");
    showCard.className = "show-card";

    const image = document.createElement("img");
    image.src =
      show.image && show.image.medium
        ? show.image.medium
        : "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";
    image.alt = show.name;
    showCard.appendChild(image);

    const title = document.createElement("h2");
    title.textContent = show.name;
    showCard.appendChild(title);

    const summary = document.createElement("p");
    summary.className = "summary";
    summary.innerHTML = show.summary || "No summary available";
    showCard.appendChild(summary);
    addReadMoreToggle(summary);

    const genres = document.createElement("p");
    genres.innerHTML = `<strong>Genres:</strong> ${show.genres.join(", ") || "N/A"}`;
    showCard.appendChild(genres);

    const status = document.createElement("p");
    status.innerHTML = `<strong>Status:</strong> ${show.status || "N/A"}`;
    showCard.appendChild(status);

    const rating = document.createElement("p");
    const ratingValue =
      show.rating && show.rating.average ? show.rating.average : "N/A";
    rating.innerHTML = `<strong>Rating:</strong> ${ratingValue}`;
    showCard.appendChild(rating);

    const runtime = document.createElement("p");
    runtime.innerHTML = `<strong>Runtime:</strong> ${show.runtime ? show.runtime + " min" : "N/A"}`;
    showCard.appendChild(runtime);

    showCard.addEventListener("click", () => {
      fetchDisplayEpisodes(show.id);
    });

    root.appendChild(showCard);
  });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodeList.forEach((episode) => {
    const episodeCard = document.createElement("div");
    episodeCard.className = "episode-card";

    const seasonTitle = document.createElement("h2");
    seasonTitle.textContent = `${episode.name} - ${makeSeasonAndEpisodes(
      episode,
    )}`;
    episodeCard.appendChild(seasonTitle);

    const image = document.createElement("img");
    image.src =
      episode.image && episode.image.medium
        ? episode.image.medium
        : "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";
    image.alt = episode.name;
    episodeCard.appendChild(image);

    const summary = document.createElement("p");
    summary.className = "summary";
    summary.innerHTML = episode.summary || "No summary available";
    episodeCard.appendChild(summary);

    addReadMoreToggle(summary);

    rootElem.appendChild(episodeCard);
  });
}

function updateCount(found, total) {
  const countDisplay = document.getElementById("count-info");
  if (countDisplay) {
    countDisplay.style.display = "inline";
    countDisplay.textContent = `Displaying ${found}/${total} episodes`;
  }
}

function renderShowData(episodes) {
  showEpisodeSearchUI();
  makePageForEpisodes(episodes);
  setupEpisodeSearch(episodes);
  updateCount(episodes.length, episodes.length);
  fillSelector(episodes);
  setupSelector(episodes);
}

function setupEpisodeSearch(allEpisodes) {
  requestAnimationFrame(() => {
    const searchInput = document.getElementById("episode-search");
    if (!searchInput) return;

    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    newSearchInput.value = "";

    newSearchInput.addEventListener("input", (event) => {
      const episodeMenu = document.getElementById("episodes-menu");
      if (episodeMenu) episodeMenu.value = "all";

      const searchTerm = event.target.value.toLowerCase();

      const filtered = allEpisodes.filter((episode) => {
        const nameMatch = episode.name.toLowerCase().includes(searchTerm);
        const summaryMatch = (episode.summary || "")
          .toLowerCase()
          .includes(searchTerm);
        return nameMatch || summaryMatch;
      });

      updateCount(filtered.length, allEpisodes.length);
      makePageForEpisodes(filtered);
    });
  });
}

function setupShowSearch(allShows) {
  const searchInput = document.getElementById("show-search");
  const countDisplay = document.getElementById("count-info");
  const total = allShows.length;

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();

    const filteredShows = allShows.filter((show) => {
      const nameMatch = show.name.toLowerCase().includes(query);
      const genreMatch = show.genres.join(" ").toLowerCase().includes(query);
      const summaryMatch = (show.summary || "").toLowerCase().includes(query);

      return nameMatch || genreMatch || summaryMatch;
    });

    const previousSearchValue = event.target.value;
    makePageForShows(filteredShows);
    document.getElementById("show-search").value = previousSearchValue; 

    countDisplay.textContent = `Displaying ${filteredShows.length} / ${total} shows`;
  });
  countDisplay.textContent = `Search results: ${total} / ${total}`;
}

function fillSelector(allEpisodes) {
  const selector = document.getElementById("episodes-menu");
  selector.innerHTML = "";

  if (!allEpisodes || allEpisodes.length === 0) {
    const option = document.createElement("option");
    option.textContent = "Wait for a show...";
    selector.appendChild(option);
    return;
  }

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "Show all episodes";
  selector.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${makeSeasonAndEpisodes(episode)} - ${episode.name}`;
    selector.appendChild(option);
  });
}

function fillShowsSelector(allShows) {
  const showMenu = document.getElementById("show-menu");
  showMenu.innerHTML = '<option value="" >select a Show...</option>';

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showMenu.appendChild(option);
  });
}

function setupSelector(allEpisodes) {
  const selector = document.getElementById("episodes-menu");
  const newSelector = selector.cloneNode(true);
  selector.parentNode.replaceChild(newSelector, selector);

  newSelector.addEventListener("change", (event) => {
    const selectId = event.target.value;

    const currentSearchInput = document.getElementById("episode-search");
    if (currentSearchInput) currentSearchInput.value = "";

    if (selectId === "all") {
      makePageForEpisodes(allEpisodes);
      updateCount(allEpisodes.length, allEpisodes.length);
    } else {
      const selectEpisode = allEpisodes.filter(
        (episode) => episode.id == selectId,
      );
      makePageForEpisodes(selectEpisode);
      updateCount(selectEpisode.length, allEpisodes.length);
    }
  });
}

function showShowSearchUI() {
  const showSearch = document.getElementById("show-search-container");
  const showSelector = document.getElementById("show-selector-container");

  const episodeSearch = document.getElementById("episode-search-container");
  const episodeSelector = document.getElementById("episode-selector-container");

  showSearch.classList.remove("hidden");
  showSelector.classList.remove("hidden");

  episodeSearch.classList.add("hidden");
  episodeSelector.classList.add("hidden");
}

function showEpisodeSearchUI() {
  const showSearch = document.getElementById("show-search-container");
  const showSelector = document.getElementById("show-selector-container");

  const episodeSearch = document.getElementById("episode-search-container");
  const episodeSelector = document.getElementById("episode-selector-container");

  showSearch.classList.add("hidden");
  showSelector.classList.add("hidden");

  episodeSearch.classList.remove("hidden");
  episodeSelector.classList.remove("hidden");
}

function makeSeasonAndEpisodes(episode) {
  const paddedSeason = episode.season.toString().padStart(2, "0");
  const paddedEpisode = episode.number.toString().padStart(2, "0");
  return `S${paddedSeason}E${paddedEpisode}`;
}

function addReadMoreToggle(summaryElement) {
  requestAnimationFrame(() => {
    const fullHeight = summaryElement.scrollHeight;

    if (fullHeight <= 80) return;

    const toggle = document.createElement("span");
    toggle.className = "read-more";
    toggle.textContent = "Read more";

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const expanded = summaryElement.classList.toggle("expanded");
      toggle.textContent = expanded ? "Read less" : "Read more";
    });

    summaryElement.insertAdjacentElement("afterend", toggle);
  });
}
