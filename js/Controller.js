export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  wireUp() {
    this.model.addedNoteEvent.subscribe(this._handleCreatedNoteEvent);
    this.model.updatedNoteEvent.subscribe(this._handleUpdatedNoteEvent);
    this.model.deletedNoteEvent.subscribe(this._handleDeletedNoteEvent);
    this.view.addNoteEvent.subscribe(this._handleCreateNoteEvent);
    this.view.updateNoteEvent.subscribe(this._handleUpdateNoteEvent);
    this.view.deleteNoteEvent.subscribe(this._handleDeleteNoteEvent);
    this.view.updateAppSettingsEvent.subscribe(this._handleUpdateAppSettings);
  }

  _handleCreatedNoteEvent = (sender, data) => {
    this.view.actionNoteCreated(data);
  };

  _handleUpdatedNoteEvent = (sender, data) => {
    this.view.actionNoteUpdated(data);
  };

  _handleDeletedNoteEvent = (sender, data) => {
    this.view.actionNoteDeleted(data);
  };

  _handleCreateNoteEvent = (sender, data) => {
    this.model.createNote(data);
  };

  _handleUpdateNoteEvent = (sender, data) => {
    this.model.updateNote(data);
  };

  _handleDeleteNoteEvent = (sender, data) => {
    this.model.deleteNote(data);
  };

  _handleUpdateAppSettings = (sender, data) => {
    this.model.updateAppSettings(data);
  };
}
