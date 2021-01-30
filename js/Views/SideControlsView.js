import AbstractView from './AbstractView.js';
import Event from '../EventDispatcher.js';
import Helper from '../Helpers.js';
import Markup from './View.Markups.js';

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
    this.parent.innerHTML = this._getParentInnerMarkup();
    this.addNoteButton = this._getElement('#action-new-note');
    this.notesListButton = this._getElement('#action-notes-list');
    return this;
  }

  _initEvents() {
    return this._addNewNoteButtonListener()._addNotesListButtonListener();
  }

  _addNewNoteButtonListener() {
    return this._addEventListener('click', this.addNoteButton, this._notifyHandler, null, this.addNoteEvent);
  }

  _addNotesListButtonListener() {
    return this._addEventListener('click', this.notesListButton, this._notifyHandler, null, this.openNotesListEvent);
  }

  _getParentInnerMarkup() {
    return Markup.getMarkup('sideControls');
  }
}
