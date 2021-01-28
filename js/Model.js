import Event from './EventDispatcher.js';
import Helper from './Helpers.js';

export default class Model {
  constructor(db) {
    this.db = db;
    this.addedNoteEvent = new Event(this);
    this.updatedNoteEvent = new Event(this);
    this.deletedNoteEvent = new Event(this);
    this.notesList = [];
    this.appSettings = {};
    this._init();
  }

  _init() {
    this._dbLoadNotesList()._dbLoadAppSettings();
  }

  _dbLoadNotesList() {
    let notesList = this.db.getNotesList();
    if (!notesList || notesList.length === 0) {
      const note = this.db.createNote(NoteDataModel.default);
      notesList.push(note);
    }
    this.notesList = notesList;
    return this;
  }

  _dbLoadAppSettings() {
    let appSettings = this.db.getAppSettings();
    if (Helper.isEmptyObject(appSettings)) {
      appSettings = new AppSettingsDataModel(AppSettingsDataModel.default);
      this.db.updateAppSettings(appSettings);
    }
    this.appSettings = appSettings;
    return this;
  }

  getNotesList() {
    return this.notesList;
  }

  getAppSettings() {
    return this.appSettings;
  }

  getApplicationData() {
    return {
      notesList: this.notesList,
      appSettings: this.appSettings,
    };
  }

  createNote(data) {
    const note = this.db.createNote(data);
    this.notesList = this.db.getNotesList();
    this.addedNoteEvent.notify(note);
  }

  updateNote(data) {
    this.notesList = this.db.updateNote(data);

    this.updatedNoteEvent.notify();
  }

  deleteNote(data) {
    this.notesList = this.db.deleteNote(data);

    this.deletedNoteEvent.notify();
  }

  updateAppSettings(settings) {
    this.settings = this.db.updateAppSettings(settings);
  }
}

export class NoteDataModel {
  constructor(data) {
    this.id = data.id;
    this.created = data.created;
    this.modified = data.modified;
    this.images = [...data.images];
    this.text = data.text;
    this.themeColor = data.themeColor;
    this.centered = data.centered;
    this.style = data.style;
    this.status = data.status;
    return this;
  }

  static get default() {
    return {
      id: undefined,
      created: new Date(),
      modified: new Date(),
      images: [],
      text: '',
      themeColor: 'green',
      style: {
        width: '305px',
        height: '315px',
        top: 0,
        left: 0,
        'z-index': 1,
      },
      centered: true,
      status: 'open',
    };
  }

  static overrideDefault(data) {
    let output = this.default;
    for (let key in data) {
      output[key] = data[key];
    }
    return output;
  }
}

export class AppSettingsDataModel {
  constructor(data) {
    this.insightEnabled = data.insightEnabled;
    this.confirmOnDelete = data.confirmOnDelete;
    this.themeMode = data.themeMode;
    this.lastColorTheme = data.lastColorTheme;
    this.highestZIndex = data.highestZIndex;
    this.ctrlViewStyle = data.ctrlViewStyle;
    this.ctrlViewStatus = data.ctrlViewStatus;
    this.ctrlViewSettings = data.ctrlViewSettings;
  }

  static get default() {
    return {
      insightEnabled: false,
      confirmOnDelete: true,
      themeMode: 'light',
      lastColorTheme: 'green',
      highestZIndex: 1,
      ctrlViewSettings: {
        style: {
          width: '320px',
          height: '500px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          'z-index': 0,
        },
        centered: false,
        status: 'closed',
      },
    };
  }
}
