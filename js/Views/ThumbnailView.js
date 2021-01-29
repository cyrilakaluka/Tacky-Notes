import AbstractView from './AbstractView.js';
import Helper from '../Helpers.js';

export default class ThumbnailView extends AbstractView {
  constructor(noteView) {
    super();
    this.noteView = noteView;
    this.note = this.noteView.note;
    this.id = this.noteView.id;
    super._init();
  }

  _createParent() {
    this.parent = Helper.createElement('li', 'thumbnail');
    this.parent.id = `thumbnail-${this.id}`;
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

  _onUpdateThemeEvent = source => {
    this.parent.dataset.colorTheme = source.colorTheme;
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
