const ART_TAGS  = ['game-design', 'level-design', 'pixelart'];
const TECH_TAGS = ['gameplay-programming', 'engine-programming', 'systems-programming'];

const TAG_LABELS = {
  'game-design':           'Game Design',
  'level-design':          'Level Design',
  'pixelart':              'Pixel Art',
  'gameplay-programming':  'Gameplay Prog.',
  'engine-programming':    'Engine Prog.',
  'systems-programming':   'Systems Prog.',
};

const TYPE_CLASSES = {
  'indie-game':   'card__type--indie-game',
  'game-jam':     'card__type--game-jam',
  'art':          'card__type--art',
  'engine':       'card__type--engine',
  'blog-post':    'card__type--blog-post',
  'mobile-game':  'card__type--mobile-game',
  'vr-game':      'card__type--vr-game',
  'board-game':   'card__type--board-game',
};

const TYPE_LABELS = {
  'indie-game':   'Indie Game',
  'game-jam':     'Game Jam',
  'art':          'Art',
  'engine':       'Engine',
  'blog-post':    'Blog Post',
  'mobile-game':  'Mobile Game',
  'vr-game':      'VR Game',
  'board-game':   'Board Game',
};

const EVENT_CLASSES = {
  'in-production': 'card__event--in-production',
  'released':      'card__event--released',
  'abandoned':     'card__event--abandoned',
};

const EVENT_LABELS = {
  'in-production': 'In production',
  'released':      'Released',
  'abandoned':     'Abandoned',
};

function updateBlogSection(mode)
{
  const grid    = document.getElementById(`blog-grid-${mode}`);
  const section = document.getElementById(`blog-section-${mode}`);
  if (!grid || !section) return;
  section.style.display = grid.children.length > 0 ? '' : 'none';
}

function initCardSlideshow(cardWrap, cover, images)
{
  if (!images || images.length === 0) return;

  const img = cardWrap.querySelector('.card__thumb img');
  if (!img) return;

  const allImages = [cover, ...images];
  let intervalId  = null;
  let index       = 0;

  cardWrap.addEventListener('mouseenter', () => {
    index = 1;
    img.src = allImages[index];
    intervalId = setInterval(() => {
      index = (index + 1) % allImages.length;
      img.src = allImages[index];
    }, 800);
  });

  cardWrap.addEventListener('mouseleave', () => {
    clearInterval(intervalId);
    intervalId = null;
    img.src = cover;
  });
}

function addProject({ name, cover = null, images = [], desc, types = [], event, tags = [], people, time, link })
{
  const artTags  = tags.filter(t => ART_TAGS.includes(t));
  const techTags = tags.filter(t => TECH_TAGS.includes(t));

  const hasDesign      = artTags.length  > 0;
  const hasProgramming = techTags.length > 0;

  if (!hasDesign && !hasProgramming)
  {
    console.warn(`addProject: projekt "${name}" nie ma żadnych tagów — nie pojawi się nigdzie.`);
    return;
  }

  const eventClass = EVENT_CLASSES[event] ?? 'card__event--jam';
  const eventLabel = EVENT_LABELS[event]  ?? event;

  const renderTypes = (arr) => arr
    .map(t => `<span class="card__type ${TYPE_CLASSES[t] ?? ''}">${TYPE_LABELS[t] ?? t}</span>`)
    .join('');

  const renderTags = (list) => list
    .map(t => `<span class="card__tag card__tag--${t}">${TAG_LABELS[t]}</span>`)
    .join('');

  const peopleStr = people === 1 || people === 'Solo'
    ? 'Solo'
    : `${people} people`;

  const thumb = cover
    ? `<img src="${cover}" alt="${name}" />`
    : `<div class="card__thumb-placeholder">podgląd</div>`;

  const buildCard = (visibleTags, isBlog = false) => `
    <a class="card-wrap${isBlog ? ' card-wrap--blog' : ''} bounce-target" href="${link}">
      <article class="card shake-target">

        <div class="card__thumb">
          ${thumb}
        </div>

        <div class="card__meta-row">
          <div class="card__types">${renderTypes(types)}</div>
          ${!isBlog ? `<span class="card__event ${eventClass}">${eventLabel}</span>` : ''}
        </div>

        <div class="card__body">
          <h3 class="card__title">${name}</h3>
          <p class="card__desc">${desc}</p>
          <div class="card__tags">${renderTags(visibleTags)}</div>
        </div>

        ${!isBlog ? `
        <div class="card__footer">
          <span class="card__meta-item">👥 ${peopleStr}</span>
          <span class="card__meta-item">⏱ ${time}</span>
        </div>` : ''}

      </article>
    </a>
  `;

  const isBlog = types.includes('blog-post');

  const insertCard = (gridId, visibleTags, blog) => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.insertAdjacentHTML('beforeend', buildCard(visibleTags, blog));
    if (cover && images.length > 0) {
      const cardWrap = grid.lastElementChild;
      initCardSlideshow(cardWrap, cover, images);
    }
  };

  if (isBlog)
  {
    if (hasDesign)      { insertCard('blog-grid-design',      artTags,  true); updateBlogSection('design'); }
    if (hasProgramming) { insertCard('blog-grid-programming', techTags, true); updateBlogSection('programming'); }
  }
  else
  {
    if (hasDesign)      insertCard('grid-design',      artTags,  false);
    if (hasProgramming) insertCard('grid-programming', techTags, false);
  }
}