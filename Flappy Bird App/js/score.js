document.addEventListener('DOMContentLoaded', () => {
    const finalScore = localStorage.getItem('finalScore');
    document.getElementById('finalScore').innerText = `Score: ${finalScore}`;
});