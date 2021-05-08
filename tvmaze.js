/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  const res = await axios.get('http://api.tvmaze.com/search/shows', {
    params: { q: query },
  });
  //Use 'Tammy' to test for broken images
  const showResults = res.data.map(function (arr) {
    const shows = arr.show;
    if (shows.image === null) {
      shows.image = { medium: 'https://tinyurl.com/tv-missing' };
    }
    return {
      id: shows.id,
      name: shows.name,
      summary: shows.summary,
      image: shows.image.medium,
    };
  });
  return showResults;

  // return [
  //   {
  //     id: 1767,
  //     name: 'The Bletchley Circle',
  //     summary:
  //       '<p><b>The Bletchley Circle</b> follows the journey of four ordinary women with extraordinary skills that helped to end World War II.</p><p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their normal lives, modestly setting aside the part they played in producing crucial intelligence, which helped the Allies to victory and shortened the war. When Susan discovers a hidden code behind an unsolved murder she is met by skepticism from the police. She quickly realises she can only begin to crack the murders and bring the culprit to justice with her former friends.</p>',
  //     image:
  //       'http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg',
  //   },
  // ];
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $('#shows-list');
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
         <img class="card-img-top" src="${show.image}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button id="epi-request" type="button" class="btn btn-primary">Episodes</button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($item);
  }
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$('#search-form').on('submit', async function handleSearch(evt) {
  evt.preventDefault();

  let query = $('#search-query').val();
  if (!query) return;

  $('#episodes-area').hide();

  let shows = await searchShows(query);

  populateShows(shows);
});

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  // TODO: get episodes from tvmaze
  //       you can get this by making GET request to
  //       http://api.tvmaze.com/shows/SHOW-ID-HERE/episodes
  // TODO: return array-of-episode-info, as described in docstring above
  // [
  //   {id: 1234, name: "Pilot", season: "1", number: "1"},
  //   {id: 3434, name: "In the Beginning", season: "1", number: "2"},
  //   /* and so on... */
  // ]

  const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  const episodes = res.data.map(function (epi) {
    return {
      id: epi.id,
      name: epi.name,
      season: epi.season,
      number: epi.number,
    };
  });
  return episodes;
}

//clear the episode list if it exists, append the new list to the page

async function populateEpisodes(episodes) {
  const $episodesList = $('#episodes-list');

  $episodesList.empty();
  $('#episodes-area').show();
  for (let episode of episodes) {
    let $epiList = $(
      `<li>${episode.name}, (${episode.season}, number ${episode.number})</li>`
    );
    $episodesList.append($epiList);
  }
}

//listen for a button click in order to generate episode results

$('#shows-list').on('click', 'button', async function (evt) {
  //pull the show id from the parent div
  let showID = $(evt.target).parent().parent().attr('data-show-id');
  let epiID = await getEpisodes(showID);
  populateEpisodes(epiID);
  //scroll to Episodes results appended on page
  $('html,body').animate(
    {
      scrollTop: $('#episodes').offset().top,
    },
    'slow'
  );
});
