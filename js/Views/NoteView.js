import WindowView from './WindowView.js';
import ViewDataCache from './ViewDataCache.js';
import Event from '../EventDispatcher.js';
import Helper from '../Helpers.js';

export default class NoteView extends WindowView {
  constructor(note) {
    super();
    this.note = note;
    this.id = note.id;
    this.style = note.style;
    this.status = note.status;
    this.centered = note.centered;
    this.zIndex = +note.style['z-index'];
    this.globalBroadcastEvent = ViewDataCache.globalBroadcastEvent;
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

  _createParent() {
    this.parent = this.window = Helper.createElement('div', 'note', 'window');
    this.parent.id = 'note-' + this.id;
    this.parent.setAttribute('tabindex', 0);
    this.parent.style.display = 'none';
    return this;
  }

  _createChildren() {
    let id = this.id;
    this.parent.innerHTML = this._getParentInnerMarkup(id).trim();
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
      ._addFocusOutListener()
      ._addWindowMoveEventListener();
  }

  _subscribeEvents() {
    this.globalBroadcastEvent.subscribe(this._onGlobalBroadcast);
    return this;
  }

  _setSavedWindowStyles() {
    super._setSavedWindowStyles();
    // Apply theme color
    this.parent.dataset.themeColor = this.note.themeColor;
    return this;
  }

  /**
   * Element Listeners
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
      this.closeNoteEvent,
      this.note
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
        this.updateThemeEvent,
        this.note
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
    this.note.status = 'closed';
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

  _getParentInnerMarkup(id) {
    return `<div id="title-bar-${id}" class="title-bar title-bar--note">
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
    <textarea id="textarea-${id}" class="panel text-area" placeholder="Take a note..."></textarea>
    <div class="panel tool-bar">
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
        <button id="#image-insertion-btn-${id}" class="button button--icon" data-hover="Add Image">
          <svg class="icon icon--image">
            <use href="icons/sprite.svg#image"></use>
          </svg>
        </button>
      </div>
    </div>
    `;
  }
}
