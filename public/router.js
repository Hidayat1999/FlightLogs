function loadPage(page) {
    fetch(page)
        .then(response => response.text())
        .then(html => {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = '';
            contentDiv.innerHTML = html; 
        })
        .catch(error => console.error('Error loading page:', error));
}

function navigate(event) {
    event.preventDefault();
    const page = event.target.getAttribute('href');
    window.history.pushState({}, '', page);
    loadPage(page);
}

// Handle browser history changes if user clicks back or forward 
window.addEventListener('popstate', () => {
    loadPage(window.location.pathname);
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', navigate);
    });
    loadPage('./home.html');
});