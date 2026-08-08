const buildsData = [
    {
        image: "images/pizza-man.jpg",
        title: "The Pizza Man",
        title_he: "איש הפיצה",                          // ← Hebrew title
        description: "A man spinning pizza dough.",
        description_he: "איש המסובב בצק פיצה."           // ← Hebrew description
    },
    {
        image: "images/Moshko-fire-bender.jpg",
        title: "Fire Bender",
        title_he: "כשף האש",
        description: "A man fire bending from a volcano.",
        description_he: "איש מכשף אש מהר געש."
    },
    {
        image: "images/avatar-ang-final.jpg",
        title: "The Avatar State",
        title_he: "מצב האווטאר",
        description: "Avatar Aang in his famous bending pose.",
        description_he: "אווטאר אנג בתנוחת הכיפוף המפורסמת שלו."
    },
    {
        image: "images/mountain-trees.jpg",
        title: "Mountain Forest",
        title_he: "יער ההר",
        description: "A nature scene with a mountain in the middle of a forest.",
        description_he: "סצנת טבע עם הר באמצע יער."
    }
];

function renderBuilds() {
    const gallery = document.querySelector('.minecraft-gallery');
    if (!gallery) return;

    // Resolve correct base path so images work from both root, pages/ dir, and pages/minecraft/ dir
    const normalizedPath = window.location.pathname.replace(/\\/g, '/');
    let imgBase = './';
    if (normalizedPath.includes('/pages/minecraft/')) {
        imgBase = '../../';
    } else if (normalizedPath.includes('/pages/')) {
        imgBase = '../';
    }

    const isHe = window.MoshkoLang && window.MoshkoLang.current === 'he';

    gallery.innerHTML = [...buildsData].reverse().map(build => {
        const title = (isHe && build.title_he) ? build.title_he : build.title;
        const desc = (isHe && build.description_he) ? build.description_he : build.description;
        return `
        <div class="gallery-item glass-card" data-aos="fade-up" style="flex: 0 1 30%; min-width: 320px; padding: 10px !important; overflow: hidden; display: flex; flex-direction: column; align-self: flex-start;">
            <img src="${imgBase}${build.image}" alt="${title}" style="width: 100%; height: auto; border-radius: 12px; display: block;">
            <div class="gallery-overlay">
                <h3>${title}</h3>
                <p>${desc}</p>
            </div>
        </div>
    `;
    }).join('');
}

// Run on initial page load
document.addEventListener('DOMContentLoaded', renderBuilds);

// Also run when navigating via SPA routing
window.addEventListener('page-load', renderBuilds);

// Re-render when language switches
window.addEventListener('lang-change', renderBuilds);
