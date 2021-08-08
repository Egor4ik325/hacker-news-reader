// JavaScript asynchronous:
// 1. callback function
// 2. promises (then/catch)
// 3. async/await (syntactic sugar) + try/catch

document.addEventListener('DOMContentLoaded', function () {
    // Navigation bar
    const nav = document.querySelector('nav');

    // All types of news stories
    const storiesTypes = ['topstories', 'newstories', 'beststories', 'askstories', 'showstories', 'jobstories'];

    // Add event listener on navbar click
    nav.addEventListener('click', event => {
        // Dispatch event
        const storiesType = event.target.id;
        if (storiesTypes.includes(storiesType)) {
            // Add stories page to the history
            history.pushState({ storiesType: storiesType }, '', storiesType);

            // Show stories
            renderStories(storiesType);
        }
    })

    // Load top stories by default
    renderStories('topstories');
});

// Previous page button
window.onpopstate = event => {
    // Get previous stories type from history
    const storiesType = event.state.storiesType;
    console.log(`Get previous ${storiesType} page`);

    // Render previous page
    renderStories(storiesType);
};

// Hacker News API base URL
const baseUrl = 'https://hacker-news.firebaseio.com/v0';

// Should be ran after updates to the stories
let updateStories;

// Renders stories in the #container
function renderStories(type) {
    // Clear single page
    const container = document.querySelector('#container');
    container.innerHTML = '';

    // Page heading
    let title = type.slice(0, -7);
    title = title[0].toUpperCase() + title.slice(1);
    const heading = document.createElement('h1');
    heading.innerHTML = `Hacker News - ${title} Stories`;

    // Story list
    const list = document.createElement('ol');

    container.append(heading);
    container.append(list);

    // Request new storie (using then/catch nesting)
    fetch(`${baseUrl}/${type}.json`)
        // Convert response promise to Object promise
        .then(response => {
            return response.json();
        })
        // The promise is resolved (fullfilled)
        .then(storyIds => {
            let n = 0;
            loadStories(storyIds, n);

            // Load more stories initialy
            if (window.scrollY + window.innerHeight >= document.body.offsetHeight) {
                n += 10;
                loadStories(storyIds, n);
            }

            updateStories = () => {
                // Reach end of document
                if (window.scrollY + window.innerHeight >= document.body.offsetHeight) {
                    n += 10;
                    loadStories(storyIds, n);
                }
            };

            // Load more stories on window scroll
            window.onscroll = updateStories;
        })
        // The promise/request is rejected
        .catch(error => {
            // Error handling
            console.log(error);
        });
}

// Load 10 stories starting from n-th
function loadStories(storyIds, n) {
    const list = document.querySelector('ol');

    // Iterate 10 stories
    for (let i = n; i < storyIds.length && i < n + 10; i++) {
        const storyId = storyIds[i];

        // If story is not hidden
        if (localStorage.getItem(storyId.toString()) === 'hidden') {
            continue;
        }

        // Asynchronous request part (immidiatly-invoked async function)
        (async () => {
            try {
                const response = await fetch(`${baseUrl}/item/${storyId}.json`);

                // If response is resolved and response status is 2xx
                if (response.ok) {
                    // Parse HTTP response body as JSON
                    let story = await response.json();
                    console.log(story);

                    if (!story.hasOwnProperty('url')) {
                        story.url = '';
                    }

                    const storyDate = new Date(story.time * 1000);
                    const storyDateFormated = storyDate.toString().split(' ').slice(1, 5).join(' ');
                    let storyDomain = story.url.match('(.*?://)?(.*?)/');
                    if (storyDomain !== null) {
                        storyDomain = storyDomain.slice(-1);
                    }

                    // Create list item with link to the story
                    const listItem = document.createElement('li');
                    listItem.className = 'story';
                    listItem.id = story.id;
                    const listLink = document.createElement('a');
                    listLink.innerHTML = story.title;
                    listLink.href = story.url;
                    const listDomain = document.createElement('span');
                    listDomain.innerHTML = ` (${storyDomain})`;
                    const listDescription = document.createElement('div');
                    listDescription.innerHTML = `<span class="story-score"><mark>${story.score}</mark> points</span> by <b>${story.by}</b> ${storyDateFormated} | <a href="javascript:void(0)" onclick="javascript:renderStoryComments(${story.id})">${story.descendants} comments</a> `.small();
                    const listHide = document.createElement('button');
                    listHide.innerHTML = 'Hide';
                    listHide.onclick = (event) => { hideStory(event); };

                    listDescription.append(listHide);
                    listItem.append(listLink);
                    listItem.append(listDomain);
                    listItem.append(listDescription);
                    list.append(listItem);
                } else {
                    // Log response with error 
                    console.log(`Non OK (2xx) response: ${response.status}`);
                }
            } catch (error) {
                console.log(error);
            }
        })()
    }
}

// Render story comments
async function renderStoryComments(storyId) {
    // Clear single page
    const container = document.querySelector('#container');
    container.innerHTML = '';

    const response = await fetch(`${baseUrl}/item/${storyId}.json`).catch(error => { console.log(error); });

    if (response.ok) {
        let story = await response.json().catch(error => { console.log(error); });

        if (!story.hasOwnProperty('url')) {
            story.url = '';
        }

        // Additional attributes
        const storyDateFormated = new Date(story.time * 1000).toString().split(' ').slice(1, 5).join(' ');
        let storyDomain = story.url.match('(.*?://)?(.*?)/');
        if (storyDomain !== null) {
            storyDomain = storyDomain.slice(-1);
        }


        // Render story
        container.innerHTML += `<a>${story.title}</a><span>${storyDomain}</span>
        <div>${story.score} points by ${story.by} on ${storyDateFormated} | \
        ${story.descendants} comments \
        <button onclick="javascript:alert('Hide');">Hide</button></div>`;

        // Render comment section
        container.innerHTML += '<div id="comments"><b>Comments:</b></div>';

        // Render first level comments
        for (const commentId of story.kids.slice(0, 10)) {
            // Response promise
            const response = await fetch(`${baseUrl}/item/${commentId}.json`).catch(error => { console.log(error); });

            // Comment object
            const comment = await response.json().catch(error => console.log(error));

            // Huminized data
            const commentDate = new Date(comment.time * 1000);

            // Render comment
            container.innerHTML += `<div class="comment"><b>${comment.by}</b> on <i>${commentDate.toString()}</i><div>
            ${comment.text}`;
        }

    } else {
        console.log(`Non 2xx response: ${response.status}`);
    }
}

function hideStory(event) {
    const buttonElement = event.target;
    const storyElement = buttonElement.parentElement.parentElement;

    // Add hidden story to the storage
    localStorage.setItem(storyElement.id.toString(), 'hidden');

    storyElement.style.animationPlayState = 'running';
    storyElement.onanimationend = () => {
        storyElement.remove();
        updateStories();
    };
}