import AbstractView from './AbstractView.js';
import ViewDataCache from './ViewDataCache.js';
import Event from '../EventDispatcher.js';

export default class RootView extends AbstractView {
  constructor() {
    super();
    this.globalBroadcastEvent = ViewDataCache.globalBroadcastEvent;
    this.globalBroadcastEvent.source = this;
    this.controlsView = ViewDataCache.controlsView;
    this.noteViews = ViewDataCache.noteViews;
    this.sideControlsView = ViewDataCache.sideControlsView;
    this.settings = ViewDataCache.appSettings;
    this.toolTip = ViewDataCache.tooltip;
    this.addNoteEvent = new Event(this);
    this.updateSettingsEvent = new Event(this);
    this.updateAllEvent = new Event(this);
    super._init()._build();
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
    this.noteViews.forEach(view => {
      this._subscribeNoteViewEvents(view);
    });
    this.controlsView.addNoteEvent.subscribe(this._onAddNoteEventFromControlsView);
    this.controlsView.focusInEvent.subscribe(this._onFocusInEventNotification);
    this.sideControlsView.addNoteEvent.subscribe(this._onAddNoteEventFromSideControlsView);
    return this;
  }

  _subscribeNoteViewEvents(view) {
    view.addNoteEvent.subscribe(this._onAddNoteEventFromNoteView);
    view.focusInEvent.subscribe(this._onFocusInEventNotification);
  }

  _build() {
    this.root.innerHTML = '';
    this.root.append(this.sideControlsView.parent);
    this.noteViews.forEach(view => {
      this._buildNoteView(view);
    });
    this.root.append(this.controlsView.parent);
    this.toolTip.attachTo(this.root).addListenersFrom(this.root);
    return this;
  }

  _buildNoteView(view) {
    const TIMEOUT_TO_FOCUS = 500;
    this.root.append(view.parent);
    if (view.zIndex === this.settings.highestZIndex) {
      setTimeout(() => view.textContent.focus(), TIMEOUT_TO_FOCUS);
    }
    view.display();
  }

  _onAddNoteEventFromNoteView = (source, data) => {
    let output = this._getDefaultNoteConfig();
    output.style['width'] = data.style['width'];
    output.style['height'] = data.style['height'];
    output.themeColor = data.themeColor;
    output.style['z-index'] = ++this.settings.highestZIndex;
    ({ top: output.style.top, left: output.style.left } = this._computeNewNotePosition(source));
    this.addNoteEvent.notify(output);
    this.updateSettingsEvent.notify(this.settings);
  };

  _onAddNoteEventFromControlsView = (source, data) => {
    this.addNoteEvent.notify(data);
  };

  _onAddNoteEventFromSideControlsView = (source, data) => {
    let notifyData;

    this.addNoteEvent.notify(data);
  };

  _onFocusInEventNotification = source => {
    let highestZIndex = this.settings.highestZIndex;
    let sourceZIndex = source.zIndex;

    const action = function () {
      if (this.id === source.id) {
        this.parent.style.zIndex = `${(this.zIndex = highestZIndex)}`;
      } else if (this.zIndex > sourceZIndex) {
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
    this.toolTip.addListenersFrom(noteView.parent);
    this._subscribeNoteViewEvents(noteView);
    this._buildNoteView(noteView);
  }
}
