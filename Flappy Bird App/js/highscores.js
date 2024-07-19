document.addEventListener('DOMContentLoaded', () => {
    const scoresList = document.getElementById('scoresList');
    const scores = JSON.parse(sessionStorage.getItem('scores')) || [];

    scores.forEach(score => {
        const listItem = document.createElement('li');
        listItem.textContent = score;
        scoresList.appendChild(listItem);
    });
});