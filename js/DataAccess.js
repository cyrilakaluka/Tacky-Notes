import * as models from './Model.js';
const NoteDataModel = models.NoteDataModel;
const AppSettingsDataModel = models.AppSettingsDataModel;

/**
 * LocalRepoProcessor Class
 *
 * * Class for performing CRUD operations with the Models
 *
 */

const LocalRepository = (function () {
  const localRepoData = {
    notes: { lastID: 0, notesList: [] },
    appSettings: {},
    controlsViewSettings: {},
  };

  const repoKeys = {
    notes: 'TackyNotes',
    appSettings: 'TackySettings',
  };

  function loadDataFromRepo() {
    let result = JSON.parse(localStorage.getItem(repoKeys.notes));

    if (result) {
      localRepoData.notes.lastID = result.lastID;
      localRepoData.notes.notesList = result.notesList.map(note => {
        note.created = new Date(note.created);
        note.modified = new Date(note.modified);
        return new NoteDataModel(note);
      });
    }

    result = JSON.parse(localStorage.getItem(repoKeys.appSettings));

    if (result) {
      localRepoData.appSettings = new AppSettingsDataModel(result);
    }
  }

  function saveToLocalRepo(key) {
    localStorage.setItem(repoKeys[key], JSON.stringify(localRepoData[key]));
  }

  class LocalRepoProcessor {
    constructor() {
      this.init();
    }

    init() {
      loadDataFromRepo();
    }

    createNote(data) {
      // Get an override default note data
      data = NoteDataModel.overrideDefault(data);
      // Assign the next ID sequence
      data.id = ++localRepoData.notes.lastID;

      // create new NoteDataModel
      let note = new NoteDataModel(data);

      // Add the new note to the notes list
      localRepoData.notes.notesList.push(note);

      // Save to local storage
      saveToLocalRepo(Object.keys(repoKeys)[0]);

      return note;
    }

    updateNote(noteDataModel) {
      // retrieve and update note on data notes list
      localRepoData.notes.notesList = localRepoData.notes.notesList.map(note =>
        note.id === noteDataModel.id ? noteDataModel : note
      );

      // Save to local storage
      saveToLocalRepo(Object.keys(repoKeys)[0]);

      // return notesList
      return [...localRepoData.notes.notesList];
    }

    deleteNote(noteDataModel) {
      //  fetch note from notes list and remove
      localRepoData.notes.notesList = localRepoData.notes.notesList.filter(note => note.id != noteDataModel.id);

      // Save to local storage
      saveToLocalRepo(Object.keys(repoKeys)[0]);

      return [...localRepoData.notes.notesList];
    }

    getNotesList() {
      return [...localRepoData.notes.notesList];
    }

    getAppSettings() {
      return { ...localRepoData.appSettings };
    }

    updateAppSettings(appSettings) {
      localRepoData.appSettings = appSettings;

      saveToLocalRepo(Object.keys(repoKeys)[1]);

      return { ...localRepoData.appSettings };
    }
  }
  return LocalRepoProcessor;
})();

export default LocalRepository;
