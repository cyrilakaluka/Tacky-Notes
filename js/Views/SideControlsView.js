import AbstractView from './AbstractView.js';
import Event from '../EventDispatcher.js';
import Helper from '../Helpers.js';

export default class SideControlsView extends AbstractView {
  constructor() {
    super();
    this.addNoteEvent = new Event(this);
    this.openNotesListEvent = new Event(this);
    super._init();
  }

  _createParent() {
    this.parent = Helper.createElement('div', 'side-controls');
    return this;
  }

  _createChildren() {
    this.parent.innerHTML = this._getParentInnerMarkup().trim();
    this.addNoteButton = this._getElement('#action-new-note');
    this.notesListButton = this._getElement('#action-notes-list');
    return this;
  }

  _initEvents() {
    return this._addNewNoteButtonListener()._addNotesListButtonListener();
    return this;
  }

  _addNewNoteButtonListener() {
    return this._addEventListener('click', this.addNoteButton, this._notifyHandler, null, this.addNoteEvent);
  }

  _addNotesListButtonListener() {
    return this._addEventListener('click', this.notesListButton, this._notifyHandler, null, this.openNotesListEvent);
  }

  _getParentInnerMarkup() {
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
}
