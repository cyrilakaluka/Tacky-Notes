/**
 * TODO - 1. Add right click options to thumbnails and create the popup styling
 * TODO - 2. TODO - Add check for confirmOnDelete algorithm as well as HTML &   styling (related to 1)
 * TODO - 3. Add logic to update z-index of elements
 * TODO - 4. Add logic for when window close button is clicked
 *
 */
import Event from './EventDispatcher.js';
import ViewDataCache from './Views/ViewDataCache.js';
import { ViewFactory } from './Views/ViewDataCache.js';

export default class View {
  constructor(data) {
    this.data = data;
    this._init();
  }

  _init() {
    ViewDataCache.init(this.data);
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
    ViewDataCache.noteViews.forEach(noteView => {
      noteView.deleteNoteEvent.subscribe(this._handleDeleteNoteEvent);
      noteView.updateNoteEvent.subscribe(this._handleUpdateNoteEvent);
    });
    ViewDataCache.controlsView.updateSettingsEvent.subscribe(this._handleUpdateAppSetting);
    ViewDataCache.settingsView.updateSettingsEvent.subscribe(this._handleUpdateAppSetting);
    ViewDataCache.rootView.addNoteEvent.subscribe(this._handleAddNoteEvent);
    ViewDataCache.rootView.updateSettingsEvent.subscribe(this._handleUpdateAppSetting);
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

  _handleUpdateAppSetting = (source, data) => {
    this.updateAppSettingsEvent.notify(data);
  };

  actionNoteCreated = data => {
    const noteView = ViewFactory.createView('note', data);
    const thumbnailView = ViewFactory.createView('thumbnail', noteView);
    ViewDataCache.noteViews.push(noteView);
    ViewDataCache.thumbnailViews.push(thumbnailView);
    ViewDataCache.rootView.prepareNewNote(noteView);
    ViewDataCache.notesListView.prepareNewThumbnail(thumbnailView);
  };
}
