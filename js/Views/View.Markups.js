const ViewMarkups = (function () {
  const markups = {
    controls: getControlsMarkup,
    note: getNoteViewMarkup,
    notesList: getNotesListMarkup,
    settings: getSettingsMarkup,
    sideControls: getSideControlsMarkup,
    root: getRootMarkup,
    thumbnail: getThumbnailMarkup,
  };

  function getControlsMarkup(data) {
    return `<div class="window__wrapper">
    <div id="notes-list-title-bar" class="title-bar title-bar--main">
    <button id="add-btn-01" class="button button--icon" data-hover="New Note">
      <svg class="icon icon--plus">
        <use href="icons/sprite.svg#plus"></use>
      </svg>
    </button>
    <button id="setting-btn-01" class="button button--icon" data-hover="Settings">
      <svg class="icon icon--settings">
        <use href="icons/sprite.svg#settings"></use>
      </svg>
    </button>
    <button id="close-btn-01-1" class="button button--icon" data-hover="Close Window">
      <svg class="icon icon--close">
        <use href="icons/sprite.svg#close"></use>
      </svg>
    </button>
  </div>
  <div id="settings-title-bar" class="title-bar title-bar--settings" data-hover="Back">
    <button id="back-btn-01" class="button button--icon">
      <svg class="icon icon--left-arrow">
        <use href="icons/sprite.svg#left-arrow"></use>
      </svg>
    </button>
    <h2 class="title">Settings</h2>
    <button id="close-btn-01-2" class="button button--icon" data-hover="Close Window">
      <svg class="icon icon--close">
        <use href="icons/sprite.svg#close"></use>
      </svg>
    </button>
  </div>
  </div>`;
  }

  function getNoteViewMarkup(data) {
    const id = data.id;
    return `<div class="window__wrapper">
    <div id="title-bar-${id}" class="title-bar title-bar--note">
      <button id="add-btn-${id}" class="button button--icon" data-hover="New Note">
        <svg class="icon icon--plus">
          <use href="icons/sprite.svg#plus"></use>
        </svg>
      </button>
      <button id="options-btn-${id}" class="button button--icon" data-hover="Menu">
        <svg class="icon icon--options">
          <use href="icons/sprite.svg#options"></use>
        </svg>
      </button>
      <button id="close-btn-${id}" class="button button--icon" data-hover="Close Note">
        <svg class="icon icon--close">
          <use href="icons/sprite.svg#close"></use>
        </svg>
      </button>
    </div>
    <div id="menu-${id}" class="menu">
      <div class="color-themes">
        <span>
          <input checked type="radio" name="color-theme" value="yellow" data-hover="Yellow" />
          <label></label>
        </span>
        <span>
          <input type="radio" name="color-theme" value="green" data-hover="Green" />
          <label></label>
        </span>
        <span>
          <input type="radio" name="color-theme" value="pink" data-hover="Pink" />
          <label></label>
        </span>
        <span>
          <input type="radio" name="color-theme" value="purple" data-hover="Purple" />
          <label></label>
        </span>
        <span>
          <input type="radio" name="color-theme" value="blue" data-hover="Blue" />
          <label></label>
        </span>
        <span>
          <input type="radio" name="color-theme" value="grey" data-hover="Grey" />
          <label></label>
        </span>
        <span>
          <input type="radio" name="color-theme" value="black" data-hover="Charcoal" />
          <label></label>
        </span>
      </div>
      <button id="notes-list-btn-${id}" class="menu__button button button--notes-list" data-hover="Notes List">
        <svg class="icon icon--menu">
          <use href="icons/sprite.svg#menu"></use>
        </svg>
        <span>Notes List</span>
      </button>
      <button id="delete-btn-${id}" class="menu__button button button--delete" data-hover="Delete Note">
        <svg class="icon icon--delete">
          <use href="icons/sprite.svg#delete"></use>
        </svg>
        <span>Delete Note</span>
      </button>
    </div>
    <div class="panel panel--text-content">
      <div id="content-wrapper-${id}" class="content-wrapper">
        <div id="contenteditable-${id}" contenteditable="true"b spellcheck="false"></div>
    </div>
    </div>
    <div id="toolbar-${id}" class="panel toolbar is-visible">
      <div class="wrapper flex justify-space-between">
        <button id="bold-btn-${id}" class="button button--icon" data-hover="Bold">
          <svg class="icon icon--bold">
            <use href="icons/sprite.svg#bold"></use>
          </svg>
        </button>
        <button id="italic-btn-${id}" class="button button--icon" data-hover="Italic">
          <svg class="icon icon--italic">
            <use href="icons/sprite.svg#italic"></use>
          </svg>
        </button>
        <button id="underline-btn-${id}" class="button button--icon" data-hover="Underline">
          <svg class="icon icon--underline">
            <use href="icons/sprite.svg#underline"></use>
          </svg>
        </button>
        <button id="strike-through-btn-${id}" class="button button--icon" data-hover="Strikethrough">
          <svg class="icon icon--strikethrough">
            <use href="icons/sprite.svg#strikethrough"></use>
          </svg>
        </button>
        <button id="bullet-list-btn-${id}" class="button button--icon" data-hover="Toggle Bullets">
          <svg class="icon icon--bullet-list">
            <use href="icons/sprite.svg#bullet-list"></use>
          </svg>
        </button>
        <button id="image-insertion-btn-${id}" class="button button--icon" data-hover="Add Image">
          <svg class="icon icon--image">
            <use href="icons/sprite.svg#image"></use>
          </svg>
        </button>
        <button id="create-link-btn-${id}" class="button button--icon" data-hover="Create Link">
          <svg class="icon icon--link">
            <use href="icons/sprite.svg#link"></use>
          </svg>
        </button>
      </div>
    </div>
    </div> 
    `;
  }

  function getNotesListMarkup(data) {
    return `
    <h2 class="header-2">Tacky Notes</h2>
    <div class="search-field">
      <input id="search" type="text" placeholder="Search..." />
      <div class="buttons">
        <button id="button-clear" class="button button--icon">
          <svg class="icon icon--close">
            <use href="icons/sprite.svg#close"></use>
          </svg>
        </button>
        <button id="button-search" class="button button--icon">
          <svg class="icon icon--search">
            <use href="icons/sprite.svg#search"></use>
          </svg>
        </button>
      </div>
    </div>
    <ul id="thumbnails" class="thumbnails">
    </ul>`;
  }

  function getSettingsMarkup(data) {
    return `
    <div class="settings settings--general">
      <h3 class="settings__header">General</h3>
      <div class="setting">
        <div class="name">Enable insights</div>
        <div class="toggle">
          <input type="checkbox" id="insights-toggle" />
          <label for="insights-toggle"> </label>
        </div>
      </div>
      <div class="setting">
        <div class="name">Confirm before deleting</div>
        <div class="toggle">
          <input type="checkbox" id="confirm-delete-toggle" />
          <label for="confirm-delete-toggle"> </label>
        </div>
      </div>
    </div>
    <div class="settings">
      <h3 class="settings__header">Switch theme</h3>
      <div class="setting setting--theme">
        <div class="toggle">
          <input type="checkbox" id="theme-toggle" />
          <label for="theme-toggle"> </label>
          <svg class="icon icon--lights">
            <use href="icons/sprite.svg#lights"></use>
          </svg>
          <svg class="icon icon--night-mode">
            <use href="icons/sprite.svg#night-mode"></use>
          </svg>
        </div>
      </div>
    </div>
    <div class="settings settings--help">
      <h3 class="settings__header">Help & feedback</h3>
      <div class="links">
        <a href="#">Help</a>
        <a href="#">Share feedback</a>
        <a href="#">Rate us</a>
      </div>
    </div>
    <div class="settings settings--about">
      <h3 class="settings__header">About</h3>
      <small class="version-info">Tacky Notes rev 1.0.0</small><br />
      <small class="copyrights">&copy; 2021 Marvis Claire Enterprise. All rights reserved.</small>
      <div class="links">
        <a href="#">Terms of use</a>
        <a href="#">Privacy Policy</a>
      </div>
    </div>`;
  }

  function getSideControlsMarkup(data) {
    return `
    <button id="action-new-note" class="button side-control">
      <svg class="icon icon--add">
        <use href="icons/sprite.svg#plus"></use>
      </svg>
      <span>Add Note</span>
    </button>
    <button id="action-notes-list" class="button side-control">
      <svg class="icon icon--menu">
        <use href="icons/sprite.svg#menu"></use>
      </svg>
      <span>Notes List</span>
    </button>`;
  }

  function getRootMarkup(data) {
    return ``;
  }

  function getThumbnailMarkup(data) {
    return `
        <small class="time"></small>
        <button class="button button--icon" data-hover="Menu">
          <svg class="icon icon--options">
            <use href="icons/sprite.svg#options"></use>
          </svg>
        </button>
        <textarea class="overview" readonly>
        </textarea>`;
  }

  return {
    getMarkup: function (type, data = null) {
      return markups[type](data).trim();
    },
  };
})();

export default ViewMarkups;
