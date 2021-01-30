import WindowView from './WindowView.js';
import Event from '../EventDispatcher.js';
import Helper from '../Helpers.js';
import Markup from './View.Markups.js';
const delay = Helper.delay;

export default class NoteView extends WindowView {
  constructor(note) {
    super();
    this.note = note;
    this.id = note.id;
    this.style = note.style;
    this.status = note.status;
    this.centered = note.centered;
    this.zIndex = +note.style['z-index'];
    this.addNoteEvent = new Event(this);
    this.deleteNoteEvent = new Event(this);
    this.closeNoteEvent = new Event(this);
    this.openNoteEvent = new Event(this);
    this.focusInEvent = new Event(this);
    this.updateTextEvent = new Event(this);
    this.updateThemeEvent = new Event(this);
    this.openNotesListEvent = new Event(this);
    this.updateNoteEvent = new Event(this);
    super._init();
  }

  /**
   * initializers
   */

  _createParent() {
    this.parent = this.window = Helper.createElement('div', 'note', 'window');
    this.parent.id = 'note-' + this.id;
    this.parent.setAttribute('tabindex', 0);
    this.parent.style.display = 'none';
    return this;
  }

  _createChildren() {
    let id = this.id;
    this.parent.innerHTML = this._getParentInnerMarkup();
    this.addButton = this._getElement(`#add-btn-${id}`);
    this.closeButton = this._getElement(`#close-btn-${id}`);
    this.menuButton = this._getElement(`#options-btn-${id}`);
    this.notesListButton = this._getElement(`#notes-list-btn-${id}`);
    this.deleteButton = this._getElement(`#delete-btn-${id}`);
    this.textArea = this._getElement(`#textarea-${id}`);
    this.boldButton = this._getElement(`#bold-btn-${id}`);
    this.italicButton = this._getElement(`#italic-btn-${id}`);
    this.underlineButton = this._getElement(`#underline-btn-${id}`);
    this.strikeThroughButton = this._getElement(`#strike-through-btn-${id}`);
    this.bulletListButton = this._getElement(`#bullet-list-btn-${id}`);
    this.imageInsertionButton = this._getElement(`#image-insertion-btn-${id}`);
    this.themeSelectors = this._getAllElements('[name="color-theme"]');
    this.optionsMenu = this._getElement(`#menu-${id}`);
    this.titleBar = this._getElement(`#title-bar-${id}`);
    return this;
  }

  _initEvents() {
    return this._addNewNoteButtonListener()
      ._addCloseButtonListener()
      ._addDeleteButtonListener()
      ._addMenuButtonListener()
      ._addNotesListButtonListener()
      ._addThemeSelectorsEventListener()
      ._addFocusInListener()
      ._addFocusOutListener();
  }

  _setSavedWindowStyles() {
    super._setSavedWindowStyles();
    // Apply theme color
    this.parent.dataset.themeColor = this.note.themeColor;
    // Set checked color theme selector
    this.themeSelectors.forEach(selector => {
      if (selector.value === this.note.themeColor) {
        selector.checked = true;
      } else {
        selector.checked = false;
      }
    });
    return this;
  }

  /**
   * Add Element Listeners
   */
  _addNewNoteButtonListener() {
    return this._addEventListener('click', this.addButton, this._notifyHandler, null, this.addNoteEvent, this.note);
  }

  _addCloseButtonListener() {
    return this._addEventListener(
      'click',
      this.closeButton,
      this._notifyHandler,
      this._onCloseButtonClick,
      [this.closeNoteEvent, this.updateNoteEvent],
      [null, this.note]
    );
  }

  _addDeleteButtonListener() {
    return this._addEventListener(
      'click',
      this.deleteButton,
      this._notifyHandler,
      null,
      this.deleteNoteEvent,
      this.note
    );
  }

  _addMenuButtonListener() {
    return this._addEventListener('click', this.menuButton, this._onMenuButtonClick)._addEventListener(
      'focusout',
      this.menuButton,
      this._onMenuFocusOut
    );
  }

  _addNotesListButtonListener() {
    return this._addEventListener('click', this.notesListButton, this._notifyHandler, null, this.openNotesListEvent);
  }

  _addThemeSelectorsEventListener() {
    this.themeSelectors.forEach(selector =>
      this._addEventListener(
        'change',
        selector,
        this._notifyHandler,
        this._onThemeSelect,
        [this.updateThemeEvent, this.updateNoteEvent],
        [null, this.note]
      )
    );
    return this;
  }

  _addTextareaEventListener() {
    return this._addEventListener(
      'change',
      this.textArea,
      this._notifyHandler,
      this._onTextareaChange,
      this.updateTextEvent,
      this.note
    );
  }

  _addFocusInListener() {
    return this._addEventListener('focusin', this.parent, this._notifyHandler, this._onFocusInOrOut, this.focusInEvent);
  }

  _addFocusOutListener() {
    return this._addEventListener('focusout', this.parent, this._onFocusInOrOut);
  }

  /***
   * Event handlers / callbacks
   */
  _onCloseButtonClick() {
    const WINDOW_CLOSE_ANIMATION_DELAY = 300;
    this.parent.classList.remove('is-visible');
    delay(WINDOW_CLOSE_ANIMATION_DELAY).then(() => (this.parent.style.zIndex = '-1'));
    this._updateZIndex()._updateStatus('closed')._notifyUpdate();
  }

  _onMenuButtonClick() {
    this.optionsMenu.classList.add('is-visible');
    this.parent.parentElement.addEventListener('mouseup', this._onIfMenuOptionSelected.bind(this), { once: true });
  }

  _onIfMenuOptionSelected(event) {
    if (event.target.closest(`#${this.optionsMenu.id}`)) {
      if (event.button === 0) {
        setTimeout(() => this.optionsMenu.classList.remove('is-visible'), 300);
      } else {
        this.parent.parentElement.addEventListener('mouseup', this._onIfMenuOptionSelected.bind(this), { once: true });
      }
    } else {
      this.optionsMenu.classList.remove('is-visible');
    }
  }

  _onMenuFocusOut() {
    // setTimeout(() => this.optionsMenu.classList.remove('is-visible'), 300);
  }

  _onThemeSelect(event) {
    this.note.themeColor = event.target.value;
    this.parent.dataset.themeColor = this.note.themeColor;
  }

  _onTextareaChange() {
    this.note.modified = new Date();
  }

  /**
   * Property update methods
   */
  _updatePosition() {
    this.note.style['top'] = this.parent.style.top;
    this.note.style['bottom'] = this.parent.style.bottom;
    this.note.style['left'] = this.parent.style.left;
    this.note.style['right'] = this.parent.style.right;
    return this;
  }

  _updateDimension() {
    const { width, height } = this.parent.getBoundingClientRect();
    this.note.style['width'] = width + 'px';
    this.note.style['height'] = height + 'px';
    return this;
  }

  _updateZIndex() {
    this.zIndex = this.parent.style.zIndex;
    this.note.style['z-index'] = this.zIndex;
  }

  _updateStatus(status) {
    this.note.status = status;
  }

  _updateCentered(value) {
    this.centered = value;
    this.note.centered = value;
    return this;
  }

  _notifyUpdate() {
    this.updateNoteEvent.notify(this.note);
  }

  /**
   * Helper methods
   */
  _getParentInnerMarkup() {
    return Markup.getMarkup('note', { id: this.id });
  }
}
