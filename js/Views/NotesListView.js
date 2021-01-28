import AbstractView from './AbstractView.js';
import ViewDataStore from './ViewDataStore.js';
import Helper from '../Helpers.js';

export default class NotesListView extends AbstractView {
  constructor() {
    super();

    this.thumbnailList = ViewDataStore.thumbnailViews;

    super._init();
  }

  _createParent() {
    this.parent = Helper.createElement('div', 'panel', 'panel--main');
    this.parent.id = 'notes-list-panel';
    return this;
  }

  _createChildren() {
    this.parent.innerHTML = this._getParentInnerMarkup().trim();
    this.search = this._getElement('#search');
    this.searchButton = this._getElement('#button-search');
    this.clearButton = this._getElement('#button-clear');
    this.thumbnails = this._getElement('#thumbnails');
    this._sortThumbnailList();
    this._refreshThumbnails();
    return this;
  }

  // Does not have any events to initialize. All events are processed via each thumbnail
  _initEvents() {
    return this;
  }

  _sortThumbnailList() {
    this.thumbnailList.sort((a, b) => a.note.modified > b.note.modified);
  }

  _refreshThumbnails() {
    this.thumbnails.innerHTML = '';
    this.thumbnailList.forEach(thumbnail => this.thumbnails.append(thumbnail.parent));
  }

  _getParentInnerMarkup() {
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

  /**
   * Public Methods
   */
  prepareNewThumbnail(thumbnailView) {
    this._sortThumbnailList();
    this._refreshThumbnails();
  }
}
