// JavaScript asynchronous:
// 1. callback function
// 2. promises (then/catch)
// 3. async/await (syntactic sugar) + try/catch


document.addEventListener('DOMContentLoaded', function () {
    // Navigation bar
    const nav = document.querySelector('nav');

    // All types of news stories
    const storyTypes = ['topstories', 'newstories', 'beststories', 'askstories', 'showstories', 'jobstories'];

    // Add event listener on navbar click
    nav.addEventListener('click', event => {
        // Dispatch event
        if (storyTypes.includes(event.target.id)) {
            renderStories(event.target.id);
        }
    })

    // Load top stories by default
    renderStories('topstories');
});

// Hacker News API base URL
baseUrl = 'https://hacker-news.firebaseio.com/v0';

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
            const n = 10;

            // Iterate and fetch first 10 stories
            for (let i = 0; i < storyIds.length && i < n; i++) {
                const storyId = storyIds[i];

                // Asynchronous request part (immidiatly-invoked async function)
                (async () => {
                    try {
                        const response = await fetch(`${baseUrl}/item/${storyId}.json`);

                        // If response is resolved and response status is 2xx
                        if (response.ok) {
                            // Parse HTTP response body as JSON
                            const story = await response.json();
                            console.log(story);
                            const storyDate = new Date(story.time * 1000);
                            const storyDateFormated = storyDate.toString().split(' ').slice(1, 5).join(' ');
                            const storyDomain = story.url.match('(.*?://)?(.*?)/').slice(-1);

                            // Create list item with link to the story
                            const listItem = document.createElement('li');
                            const listLink = document.createElement('a');
                            listLink.innerHTML = story.title;
                            listLink.href = story.url;
                            const listDomain = document.createElement('span');
                            listDomain.innerHTML = ` (${storyDomain})`;
                            const listDescription = document.createElement('div');
                            listDescription.innerHTML = `<mark>${story.score}</mark> points by <b>${story.by}</b> ${storyDateFormated} | <a href="javascript:void(0)" onclick="javascript:renderStoryComments(${story.id})">${story.descendants} comments</a> `.small();
                            const listHide = document.createElement('button');
                            listHide.innerHTML = 'Hide';
                            listHide.onclick = () => { alert('hide'); };

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
        })
        // The promise/request is rejected
        .catch(error => {
            // Error handling
            console.log(error);
        });
}

// Render story comments
async function renderStoryComments(storyId) {
    // Clear single page
    const container = document.querySelector('#container');
    container.innerHTML = '';

    const response = await fetch(`${baseUrl}/item/${storyId}.json`).catch(error => { console.log(error); });

    if (response.ok) {
        const story = await response.json().catch(error => { console.log(error); });

        // Additional attributes
        const storyDateFormated = new Date(story.time * 1000).toString().split(' ').slice(1, 5).join(' ');
        const storyDomain = story.url.match('(.*?://)?(.*?)/').slice(-1);

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