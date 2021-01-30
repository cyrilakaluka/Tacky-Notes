import AbstractView from './AbstractView.js';
import ViewDataCache from './ViewDataCache.js';
import Helper from '../Helpers.js';
import Markup from './View.Markups.js';

export default class NotesListView extends AbstractView {
  constructor() {
    super();

    this.thumbnailList = ViewDataCache.thumbnailViews;

    super._init();
  }

  _createParent() {
    this.parent = Helper.createElement('div', 'panel', 'panel--main');
    this.parent.id = 'notes-list-panel';
    return this;
  }

  _createChildren() {
    this.parent.innerHTML = this._getParentInnerMarkup();
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
    return Markup.getMarkup('notesList');
  }

  /**
   * Public Methods
   */
  prepareNewThumbnail(thumbnailView) {
    this._sortThumbnailList();
    this._refreshThumbnails();
  }
}
