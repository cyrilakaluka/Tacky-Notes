import {
  ControlsView,
  NotesListView,
  NoteView,
  RootView,
  SettingsView,
  SideControlsView,
  ThumbnailView,
} from './Index.js';
import Event from '../EventDispatcher.js';

export default class ViewDataStore {
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

export class ViewFactory {
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
