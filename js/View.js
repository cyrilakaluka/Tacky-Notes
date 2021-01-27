/**
 * TODO - 1. Add right click options to thumbnails and create the popup styling
 * TODO - 2. Implement event dispatcher on each note to update the thumbnails
 * TODO - 3. Try to move the functions to specific classes to check if it still works
 * TODO - 4. TODO - Add check for confirmOnDelete algorithm as well as HTML & styling (related to 1)
 * TODO - 5. Add logic to display pop up description for key elements
 * TODO - 6. Add logic to update z-index of elements
 *
 */
import Event from './EventDispatcher.js';
import Helper from './Helpers.js';

class ContextMenu {
  constructor(event, config, callback) {
    this.root = document.body;
    this.callback = callback;
    this.event = event;
    this.config = config;
  }

  run() {
    if (this.event.type !== 'contextmenu') return;

    this._init()._setMenuPosition()._display();
  }

  _init() {
    this.parent = Helper.createElement('div', 'context-menu');
    this.parent.id = 'context-menu';
    this.parent.style.zIndex = '-999999999';
    this.components = this._getComponents();
    this.parent.append(...this.components.map(c => c.element));
    this.root.append(this.parent);
    this._initializeListeners();
    return this;
  }

  _setMenuPosition() {
    const offSet = 5;
    const menuBR = this.parent.getBoundingClientRect();
    const rootBR = this.root.getBoundingClientRect();
    const targetSize = { width: menuBR.width + offSet, height: menuBR.height + offSet };
    const rootSize = { width: rootBR.width, height: rootBR.height };
    const eventCoordinate = { x: this.event.clientX, y: this.event.clientY };
    const spaceExistsRight = rootSize.width - eventCoordinate.x > targetSize.width;
    const spaceExistsBottom = rootSize.height - eventCoordinate.y > targetSize.height;
    const spaceExistsLeft = eventCoordinate.x > targetSize.width;
    const spaceExistsTop = eventCoordinate.y > targetSize.height;

    if (spaceExistsBottom && spaceExistsRight) {
      this.position = { x: this.event.clientX, y: this.event.clientY };
    } else if (spaceExistsBottom && spaceExistsLeft) {
      this.position = { x: this.event.clientX - menuBR.width, y: this.event.clientY };
    } else if (spaceExistsTop && spaceExistsLeft) {
      this.position = { x: this.event.clientX - menuBR.width, y: this.event.clientY - menuBR.height };
    } else if (spaceExistsTop && spaceExistsRight) {
      this.position = { x: this.event.clientX, y: this.event.clientY - menuBR.height };
    } else {
      this.position = { x: -rootBR.width, y: -rootBR.height };
    }
    return this;
  }

  _display() {
    this.parent.style.left = `${this.position.x}px`;
    this.parent.style.top = `${this.position.y}px`;
    this.parent.style.zIndex = '999999999';
    this.parent.classList.add('is-visible');
    return this;
  }

  _destroy() {
    this.parent.classList.remove('is-visible');
    this.components.forEach(component => {
      component.element.removeEventListener('click', this.callback);
      component.element.remove();
    });
    this.parent.remove();
  }

  _initializeListeners() {
    this.components.forEach(component => {
      if (component.action) {
        component.element.addEventListener('click', () => {
          this.callback(component.command);
          this._destroy(this.callback);
        });
      }
    });

    this.root.addEventListener('mousedown', this._onMouseDownEvent);
  }

  _onMouseDownEvent = event => {
    if (!event.target.closest(`#${this.parent.id}`)) {
      this._destroy();
    }
    this.root.removeEventListener('mousedown', this._onMouseDownEvent);
  };

  _getComponents() {
    let output = [];
    const components = this.config.components;
    // get the markup for the button component
    components.forEach(component => {
      const command = component.command;
      const text = component.text;
      let action = true;
      if (component.enabled) {
        const markup = this._getParentMarkup(command, text);
        const element = this._htmlToElement(markup);
        if (component.greyed) {
          element.classList.add('greyed');
          action = false;
        }
        output.push({ command, element, action });
      }
    });
    return output;
  }

  _getParentMarkup(name, text) {
    name = name.toLowerCase();
    return `<button class="button">
      <svg class="icon icon--${name}">
      <use href="icons/sprite.svg#${name}"></use>
       </svg>
      <span>${text}</span>
      </button>`.trim();
  }
}

const Tooltip = (function () {
  const mousePosition = { x: -1, y: -1 };
  let timeoutId = 0;
  /**
   *  Displays a tool tip on a hovered element with attribute 'data-hover'.
   *
   * Three mouse events are added to apply a small delay and latch unto the  position of the mouse pointer stored during the mousemove event inside the target element. Here, closure is applied to save the clientX and ClientY values of the mouse position as well as the ID of setTimeout for cancellation by the conceal method.
   */

  class Tooltip {
    constructor() {
      this.parent = Helper.createElement('div', 'tooltip');
      this.parent.id = 'tooltip';
    }

    _display = event => {
      const offset = event.target.offsetHeight;
      const innerText = event.target.getAttribute('data-hover');
      // set styling
      this.parent.style.top = `${mousePosition.y - offset}px`;
      this.parent.style.left = `${mousePosition.x}px`;
      this.parent.innerText = innerText;
      this.parent.classList.add('is-visible');
      this.parent.style.zIndex = '99999999';
    };

    _clearThenConceal = () => {
      // clear timeouts if display hasn't been executed
      clearTimeout(timeoutId);
      // set styling
      this.parent.classList.remove('is-visible');
      this.parent.style.zIndex = '-99999999';
    };

    _delayThenDisplay = event => {
      timeoutId = setTimeout(this._display, 100, event);
    };

    _updateMousePosition = event => {
      mousePosition.x = event.clientX;
      mousePosition.y = event.clientY;
    };

    _extractElementsThen(parent, callback) {
      const elements = parent.querySelectorAll('[data-hover]');
      elements.forEach(element => callback(element));
    }

    addElementsFrom(parent) {
      this._extractElementsThen(parent, element => {
        element.addEventListener('mouseover', this._delayThenDisplay);
        element.addEventListener('mousemove', this._updateMousePosition);
        element.addEventListener('mouseout', this._clearThenConceal);
      });
    }

    destroyListenersFrom(parent) {
      this._extractElementsThen(parent, element => {
        element.removeEventListener('mouseover', this._delayThenDisplay);
        element.removeEventListener('mousemove', this._updateMousePosition);
        element.removeEventListener('mouseout', this._clearThenConceal);
      });
    }
  }

  return Tooltip;
})();

class AbstractView {
  constructor() {
    if (this.constructor === AbstractView) {
      throw new Error('Can not instantiate an abstract class!');
    }
  }

  _init() {
    return this._createParent()._createChildren()._initEvents()._subscribeToBroadcast();
  }

  _subscribeToBroadcast() {
    if (this.globalBroadcastEvent) this.globalBroadcastEvent.subscribe(this._onGlobalBroadcast.bind(this));
    return this;
  }

  _onGlobalBroadcast(source, action) {
    action.call(this);
  }

  /**
   * Notify Event handler
   */
  _notifyHandler(event, callback, notifier, data) {
    if (callback) {
      if (callback.call(this, event)) {
        return;
      }
    }
    notifier = notifier instanceof Array ? notifier : [notifier];
    data = data instanceof Array ? data : [data];

    notifier.forEach((n, idx) => {
      n.notify(data[idx]);
    });
  }

  /**
   *
   * @param {String} type - The type of event e.g 'click', 'change' etc
   * @param {HTMLElement} element - The HTML Element to listen to event
   * @param {Function} handler - The function that handles the DOM event. The DOM event will be supplied  as the first parameter to the handler
   * @param {Function} callback - Optional: The function to run prior to event notification. If provided, the DOM event parameter will be called with this function instead
   * @param {Event} notifier - Optional: The event dispatch notifier
   * @param {any} data - Optional: The data to set as parameter when notifier's notify method is called
   * @returns {this} this - The caller's object reference
   */
  _addEventListener(type, element, handler, callback, notifier, data) {
    element.addEventListener(type, event => {
      handler.call(this, event, callback, notifier, data);
    });
    return this;
  }

  /***
   * Helper methods
   */
  _getElement(selector) {
    return this.parent.querySelector(selector);
  }

  _getAllElements(selector) {
    return this.parent.querySelectorAll(selector);
  }

  _getCenterCoordinates() {
    // Get body bounding rect as a reference and extract width and height values
    const { width: bodyWidth, height: bodyHeight } = document.body.getBoundingClientRect();
    const thisWidth = +this.style.width.replace('px', '');
    const thisHeight = +this.style.height.replace('px', '');

    return {
      top: bodyHeight * 0.5 - thisHeight * 0.5,
      left: bodyWidth * 0.5 - thisWidth * 0.5,
    };
  }

  /**
   * Abstract methods - Implementation in concrete object required
   */
  _createParent() {
    throw new Error('This method must be implemented in concrete object');
  }

  _createChildren() {
    throw new Error('This method must be implemented in concrete object');
  }

  _initEvents() {
    throw new Error('This method must be implemented in concrete object');
  }

  _initEvents() {
    throw new Error('This method must be implemented in concrete object');
  }

  _getParentInnerMarkup() {
    throw new Error('This method must be implemented in concrete object');
  }

  /**
   * Public methods
   */
  display() {
    if (this.status === 'open') {
      this.parent.style.display = 'flex';
      this.parent.classList.add('is-visible');
    }
  }

  conceal() {
    this.parent.classList.remove('is-visible');
    setTimeout(() => (this.parent.style.display = 'none'), 1000);
  }
}

class ThumbnailView extends AbstractView {
  constructor(noteView) {
    super();
    this.noteView = noteView;
    this.note = this.noteView.note;
    super._init();
  }

  _createParent() {
    this.parent = Helper.createElement('li', 'thumbnail');
    this.parent.id = `thumbnail-${this.note.id}`;
    this.parent.dataset.themeColor = this.note.themeColor;
    return this;
  }

  _createChildren() {
    this.parent.innerHTML = this._getParentInnerMarkup().trim();
    this.time = this._getElement('.time');
    this.time.innerText = this.note.modified.toLocaleTimeString();
    this.overview = this._getElement('.overview');
    this.overview.innerText = this.note.text;
    this.button = this._getElement('.button');
    return this;
  }

  _initEvents() {
    return this._addOpenNoteListener()._addContextMenuListener();
  }

  _subscribeEvents() {
    this.noteView.openNoteEvent.subscribe(this._onOpenNoteEvent);
    this.noteView.closeNoteEvent.subscribe(this._onCloseNoteEvent);
    this.noteView.updateTextEvent.subscribe(this._onUpdateTextEvent);
    this.noteView.updateThemeEvent.subscribe(this._onUpdateThemeEvent);
    return this;
  }

  _addContextMenuListener() {
    return this._addEventListener('contextmenu', this.parent, this._onContextMenuEvent);
  }

  _addOpenNoteListener() {
    return this._addEventListener('dblclick', this.parent, this._onDblClickEvent);
  }

  /***
   * Subscriber methods
   */
  _onCloseNoteEvent = () => {
    this.parent.classList.remove('is-open');
  };

  _onOpenNoteEvent = () => {
    this.parent.classList.add('is-open');
  };

  _onUpdateTextEvent = (source, data) => {
    this.overview.value = data.text;
  };

  _onUpdateThemeEvent = (source, data) => {
    this.parent.dataset.colorTheme = data.colorTheme;
  };

  /**
   * Event handlers
   */
  _onDblClickEvent() {
    this.noteView.openNoteEvent.notify();
  }

  _onContextMenuEvent(event) {
    event.preventDefault();

    const config = {
      type: 'thumbnail',
      components: [
        { command: 'open', text: 'Open Note', enabled: true, greyed: false },
        { command: 'close', text: 'Close Note', enabled: true, greyed: false },
        { command: 'delete', text: 'Delete Note', enabled: true, greyed: false },
      ],
    };
    config.components[0].enabled = !this.note.text === '' && this.note.status === 'closed';
    config.components[1].enabled = !this.note.text === '' && this.note.status === 'open';

    const contextMenu = new ContextMenu(event, config, this._onContextMenuSelected.bind(this));
    contextMenu.run();
  }

  _onContextMenuSelected(command) {
    if (command === 'open') {
      this.noteView.openNoteEvent.notify(this.note);
    } else if (command === 'close') {
      this.noteView.closeNoteEvent.notify(this.note);
    } else if (command === 'delete') {
      this.noteView.deleteNoteEvent.notify(this.note);
    } else {
      throw new Error('The required command was not received from context menu event');
    }
  }

  _getParentInnerMarkup() {
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
}

class NoteView extends AbstractView {
  constructor(note) {
    super();
    this.note = note;
    this.id = note.id;
    this.style = note.style;
    this.status = note.status;
    this.zIndex = +note.style['z-index'];
    this.globalBroadcastEvent = ViewDataStore.globalBroadcastEvent;
    this.addNoteEvent = new Event(this);
    this.deleteNoteEvent = new Event(this);
    this.closeNoteEvent = new Event(this);
    this.openNoteEvent = new Event(this);
    this.focusInEvent = new Event(this);
    this.updateTextEvent = new Event(this);
    this.updateThemeEvent = new Event(this);
    this.openNotesListEvent = new Event(this);
    this.updateNoteEvent = new Event(this);
    super._init()._assignValues();
  }

  _createParent() {
    this.parent = Helper.createElement('div', 'note', 'window');
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
    return this;
  }

  _initEvents() {
    return this._addNewNoteButtonListener()
      ._addCloseButtonListener()
      ._addDeleteButtonListener()
      ._addMenuButtonListener()
      ._addNotesListButtonListener()
      ._addThemeSelectorsEventListener()
      ._addFocusInListener();
  }

  _assignValues() {
    // Apply CSS Styling
    for (let key in this.style) {
      this.parent.style[key] = this.style[key];
    }
    // Compute and assign position if center property is true
    if (this.note.center) {
      const { top, left } = this._getCenterCoordinates();
      this.parent.style.top = `${top}px`;
      this.parent.style.left = `${left}px`;
    }
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

  /**
   * A function that sets a closed in value to true if the event is 'focusin' else false if 'focusout'. This is to control the execution of the focusInEvent dispatch notifier to run only once till a focusout occurs.
   */
  _onFocusInOrOut = (() => {
    let isFocusedIn = false;

    return event => {
      return (isFocusedIn = event.type === 'focusin' ? true : false);
    };
  })();

  _getParentInnerMarkup(id) {
    return `<div class="title-bar title-bar--note">
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

class NotesListView extends AbstractView {
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

class SettingsView extends AbstractView {
  constructor() {
    super();
    this.settings = ViewDataStore.appSettings;
    this.updateSettingsEvent = new Event(this);
    super._init();
  }

  _createParent() {
    this.parent = Helper.createElement('div', 'panel', 'panel--settings');
    this.parent.id = 'settings-panel';
    return this;
  }

  _createChildren() {
    this.parent.innerHTML = this._getParentInnerMarkup().trim();
    this.enableInsightsCheckbox = this._getElement('#insights-toggle');
    this.confirmOnDeleteCheckbox = this._getElement('#confirm-delete-toggle');
    this.themeModeCheckbox = this._getElement('#theme-toggle');
    return this;
  }

  _initEvents() {
    return this._addInsightEnableEvent()._addConfirmOnDeleteEvent()._addThemeModeSelectEvent();
  }

  /**
   * Element Listeners
   */
  _addInsightEnableEvent() {
    return this._addEventListener(
      'click',
      this.enableInsightsCheckbox,
      this._notifyHandler,
      this._onInsightEnableClick,
      this.updateSettingsEvent,
      this.settings
    );
  }

  _addConfirmOnDeleteEvent() {
    return this._addEventListener(
      'click',
      this.confirmOnDeleteCheckbox,
      this._notifyHandler,
      this._onConfirmOnDeleteClick,
      this.updateSettingsEvent,
      this.settings
    );
  }

  _addThemeModeSelectEvent() {
    return this._addEventListener(
      'click',
      this.themeModeCheckbox,
      this._notifyHandler,
      this._onThemeCheckboxClick,
      this.updateSettingsEvent,
      this.settings
    );
  }

  /***
   * Event callbacks
   */
  _onInsightEnableClick(event) {
    this.settings.insightEnabled = event.target.checked;
  }

  _onConfirmOnDeleteClick(event) {
    this.settings.confirmOnDelete = event.target.checked;
  }

  _onThemeCheckboxClick(event) {
    this.settings.themeMode = event.target.checked ? 'light' : 'dark';
    document.body.setAttribute('data-theme', this.settings.themeMode);
  }

  _getParentInnerMarkup() {
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
}

class ControlsView extends AbstractView {
  constructor() {
    super();
    this.id = 0;
    this.settings = ViewDataStore.appSettings;
    this.style = this.settings.ctrlViewStyle;
    this.status = this.settings.ctrlViewStatus;
    this.zIndex = +this.settings.ctrlViewStyle['z-index'];
    this.addNoteEvent = new Event(this);
    this.updateSettingsEvent = new Event(this);
    this.focusInEvent = new Event(this);
    this.globalBroadcastEvent = ViewDataStore.globalBroadcastEvent;
    this.settingsView = ViewDataStore.settingsView;
    this.notesListView = ViewDataStore.notesListView;
    super._init();
  }

  _createParent() {
    this.parent = Helper.createElement('div', 'controls', 'window');
    this.parent.id = 'controls';
    this.parent.setAttribute('tabindex', 0);
    this.parent.style.display = 'none';
    for (let key in this.style) {
      this.parent.style[key] = this.style[key];
    }
    return this;
  }

  _createChildren() {
    this.parent.innerHTML = this._getParentInnerMarkup().trim();
    this.parent.append(this.notesListView.parent);
    this.parent.append(this.settingsView.parent);
    this.addNoteButton = this._getElement('#add-btn-01');
    this.settingsButton = this._getElement('#setting-btn-01');
    this.closeButton1 = this._getElement('#close-btn-01-1');
    this.backButton = this._getElement('#back-btn-01');
    this.closeButton2 = this._getElement('#close-btn-01-2');
    this.settingsTitleBar = this._getElement('#settings-title-bar');
    this.mainTitleBar = this._getElement('#notes-list-title-bar');
    this.settingsPanel = this._getElement('#settings-panel');
    this.mainPanel = this._getElement('#notes-list-panel');
    return this;
  }

  _initEvents() {
    return this._addNewNoteButtonListener()
      ._addSettingsButtonListener()
      ._addCloseButtonEventListener()
      ._addBackButtonListener();
  }

  _addNewNoteButtonListener() {
    return this._addEventListener('click', this.addNoteButton, this._notifyHandler, null, this.addNoteEvent);
  }

  _addSettingsButtonListener() {
    return this._addEventListener('click', this.settingsButton, this._onSettingsButtonClick);
  }

  _addCloseButtonEventListener() {
    [this.closeButton1, this.closeButton2].forEach(button =>
      this._addEventListener(
        'click',
        button,
        this._notifyHandler,
        this._onCloseButtonClick,
        this.updateSettingsEvent,
        this.settings
      )
    );
    return this;
  }

  _addBackButtonListener() {
    return this._addEventListener('click', this.backButton, this._onBackButtonClick);
  }

  _onSettingsButtonClick() {
    this.mainTitleBar.classList.remove('show');
    this.settingsTitleBar.classList.add('show');
    this.mainPanel.classList.remove('show');
    this.settingsPanel.classList.add('show');
  }

  _onBackButtonClick() {
    this.mainTitleBar.classList.add('show');
    this.settingsTitleBar.classList.remove('show');
    this.mainPanel.classList.add('show');
    this.settingsPanel.classList.remove('show');
  }

  _onCloseButtonClick() {
    this.settings.status = 'closed';
  }

  _getParentInnerMarkup() {
    return `<div id="notes-list-title-bar" class="title-bar title-bar--main">
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
  </div>`;
  }
}

class SideControlsView extends AbstractView {
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

class RootView extends AbstractView {
  constructor() {
    super();
    this.globalBroadcastEvent = ViewDataStore.globalBroadcastEvent;
    this.globalBroadcastEvent.source = this;
    this.controlsView = ViewDataStore.controlsView;
    this.noteViews = ViewDataStore.noteViews;
    this.sideControlsView = ViewDataStore.sideControlsView;
    this.settings = ViewDataStore.appSettings;
    this.addNoteEvent = new Event(this);
    this.updateSettingsEvent = new Event(this);
    this.updateAllEvent = new Event(this);
    this._init()._build();
  }

  _init() {
    return this._createParent()._createChildren()._initEvents()._subscribeEvents();
  }

  _createParent() {
    this.parent = this.root = document.getElementById('root');
    return this;
  }

  _createChildren() {
    return this;
  }

  _initEvents() {
    return this;
  }

  _subscribeEvents() {
    // NoteViewModel events
    this.noteViews.forEach(noteView => {
      noteView.addNoteEvent.subscribe(this._onAddNoteEventFromNoteView);
      noteView.focusInEvent.subscribe(this._onFocusInEvent);
    });
    this.controlsView.addNoteEvent.subscribe(this._onAddNoteEventFromControlsView);
    this.controlsView.focusInEvent.subscribe(this._onFocusInEvent);
    this.sideControlsView.addNoteEvent.subscribe(this._onAddNoteEventFromSideControlsView);
    return this;
  }

  _build() {
    this.root.innerHTML = '';
    this.root.append(this.sideControlsView.parent);
    this.noteViews.forEach(view => {
      this.root.append(view.parent);
      if (view.zIndex === this.settings.highestZIndex) {
        setTimeout(() => view.textArea.focus(), 500);
      }
      view.display();
    });
    this.root.append(this.controlsView.parent);
    this.toolTip = new Tooltip();
    this.root.append(this.toolTip.parent);
    this.toolTip.addElementsFrom(this.root);
    return this;
  }

  _onAddNoteEventFromNoteView = (source, data) => {
    let output = this._getDefaultNoteConfig();
    output.style['width'] = data.style['width'];
    output.style['height'] = data.style['height'];
    output.themeColor = data.themeColor;
    output.style['z-index'] = ++this.settings.highestZIndex;
    ({ top: output.style.top, left: output.style.left } = this._computeNewNotePosition(source));
    this.addNoteEvent.notify(output);
  };

  _onAddNoteEventFromControlsView = (source, data) => {
    this.addNoteEvent.notify(data);
  };

  _onAddNoteEventFromSideControlsView = (source, data) => {
    let notifyData;

    this.addNoteEvent.notify(data);
  };

  _onFocusInEvent = source => {
    let highestZIndex = this.settings.highestZIndex;

    const action = function () {
      if (this.id === source.id) {
        this.parent.style.zIndex = `${(this.zIndex = highestZIndex)}`;
      } else if (this.zIndex > source.zIndex) {
        this.parent.style.zIndex = `${--this.zIndex}`;
      }
    };
    this.globalBroadcastEvent.notify(action);
    this.updateAllEvent.notify();
  };

  _getDefaultNoteConfig() {
    return {
      center: false,
      themeColor: 'green',
      style: {
        width: '305px',
        height: '315px',
        top: 0,
        left: 0,
        'z-index': 1,
      },
      status: 'open',
    };
  }

  _computeNewNotePosition(source) {
    const { width, height, top, left } = source.parent.getBoundingClientRect();
    const { width: rootWidth, height: rootHeight } = this.root.getBoundingClientRect();
    const gap = 10;

    const spaceExistsRight = width * 2 + left + gap < rootWidth;
    const spaceExistsLeft = left - (width + gap) > 0;
    const spaceExistsTop = top - (height + gap) > 0;
    const spaceExistsBottom = height * 2 + top + gap < rootHeight;

    let output;

    if (spaceExistsRight) {
      output = { top: top, left: left + width + gap };
    } else if (spaceExistsLeft) {
      output = { top: top, left: left - (width + gap) };
    } else if (spaceExistsTop) {
      output = { top: top - (height + gap), left: left };
    } else if (spaceExistsBottom) {
      output = { top: top + height + gap };
    } else {
      let offSet = 10;
      output = { top: top - offSet, left: left - offSet };
    }
    output.top = output.top + 'px';
    output.left = output.left + 'px';
    return output;
  }

  /**
   * Public Methods
   */
  prepareNewNote(noteView) {
    // subscribe to new note view events
    noteView.addNoteEvent.subscribe(this._onAddNoteEventFromNoteView);
    noteView.focusInEvent.subscribe(this._onFocusInEvent);
    // append note view's parent element to root
    this.root.append(noteView.parent);
    this.toolTip.addElementsFrom(noteView.parent);
    setTimeout(() => noteView.textArea.focus(), 500);
    noteView.display();
  }
}

class ViewDataStore {
  static init({ appSettings, notesList }) {
    this._appSettings = appSettings;
    this._notesList = notesList;
    this._globalBroadcastEvent = new Event();
    this._noteViews = notesList.map(note => ViewFactory.createView('note', note));
    this._thumbnailViews = this._noteViews.map(noteView => ViewFactory.createView('thumbnail', noteView));
    this._settingsView = ViewFactory.createView('settings');
    this._notesListView = ViewFactory.createView('notesList');
    this._controlsView = ViewFactory.createView('controls');
    this._sideControlsView = ViewFactory.createView('sideControls');
    this._rootView = ViewFactory.createView('root');
  }

  static get appSettings() {
    return this._appSettings;
  }

  static get notesList() {
    return this._notesList;
  }

  static get globalBroadcastEvent() {
    return this._globalBroadcastEvent;
  }

  static get noteViews() {
    return this._noteViews;
  }

  static get thumbnailViews() {
    return this._thumbnailViews;
  }

  static get settingsView() {
    return this._settingsView;
  }

  static get notesListView() {
    return this._notesListView;
  }

  static get controlsView() {
    return this._controlsView;
  }

  static get sideControlsView() {
    return this._sideControlsView;
  }

  static get rootView() {
    return this._rootView;
  }
}

class ViewFactory {
  constructor() {}

  static createView(type, data) {
    const factory = {
      note: data => new NoteView(data),
      thumbnail: data => new ThumbnailView(data),
      notesList: () => new NotesListView(),
      settings: () => new SettingsView(),
      controls: () => new ControlsView(),
      sideControls: () => new SideControlsView(),
      root: () => new RootView(),
    };

    return factory[type](data);
  }
}

export default class View {
  constructor(data) {
    this.data = data;
    this._init();
  }

  _init() {
    ViewDataStore.init(this.data);
    return this._createEvents()._subscribeEvents();
  }

  _createEvents() {
    this.addNoteEvent = new Event(this);
    this.deleteNoteEvent = new Event(this);
    this.updateNoteEvent = new Event(this);
    this.updateAppSettingsEvent = new Event(this);
    this.updateControlsViewSettingsEvent = new Event(this);
    return this;
  }

  _subscribeEvents() {
    ViewDataStore.noteViews.forEach(noteView => {
      noteView.deleteNoteEvent.subscribe(this._handleDeleteNoteEvent);
      noteView.updateNoteEvent.subscribe(this._handleUpdateNoteEvent);
    });
    ViewDataStore.controlsView.updateSettingsEvent.subscribe(this._handleUpdateControlsSettings);
    ViewDataStore.settingsView.updateSettingsEvent.subscribe(this._handleUpdateAppSetting);
    ViewDataStore.rootView.addNoteEvent.subscribe(this._handleAddNoteEvent);
    return this;
  }

  _handleAddNoteEvent = (source, data) => {
    this.addNoteEvent.notify(data);
  };

  _handleDeleteNoteEvent = (source, data) => {
    this.deleteNoteEvent.notify(data);
  };

  _handleUpdateNoteEvent = (source, data) => {
    this.updateNoteEvent.notify(data);
  };

  _handleUpdateControlsSettings = (source, data) => {
    this.updateControlsViewSettingsEvent.notify(data);
  };

  _handleUpdateAppSetting = (source, data) => {
    this.updateAppSettingsEvent(data);
  };

  actionNoteCreated = data => {
    const noteView = ViewFactory.createView('note', data);
    const thumbnailView = ViewFactory.createView('thumbnail', noteView);
    ViewDataStore.noteViews.push(noteView);
    ViewDataStore.thumbnailViews.push(thumbnailView);
    ViewDataStore.rootView.prepareNewNote(noteView);
    ViewDataStore.notesListView.prepareNewThumbnail(thumbnailView);
  };
}
