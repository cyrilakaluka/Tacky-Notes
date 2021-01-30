import WindowView from './WindowView.js';
import ViewDataCache from './ViewDataCache.js';
import Event from '../EventDispatcher.js';
import Helper from '../Helpers.js';
import Markup from './View.Markups.js';

export default class ControlsView extends WindowView {
  constructor() {
    super();
    this.id = 0;
    this.settings = ViewDataCache.appSettings;
    this.style = this.settings.ctrlViewSettings.style;
    this.centered = this.settings.ctrlViewSettings.centered;
    this.status = this.settings.ctrlViewSettings.status;
    this.zIndex = +this.settings.ctrlViewSettings.style['z-index'];
    this.addNoteEvent = new Event(this);
    this.updateSettingsEvent = new Event(this);
    this.focusInEvent = new Event(this);
    this.settingsView = ViewDataCache.settingsView;
    this.notesListView = ViewDataCache.notesListView;
    super._init();
  }

  _createParent() {
    this.parent = this.window = Helper.createElement('div', 'controls', 'window');
    this.parent.id = 'controls';
    this.parent.setAttribute('tabindex', 0);
    this.parent.style.display = 'none';
    return this;
  }

  _createChildren() {
    this.parent.innerHTML = this._getParentInnerMarkup();
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
    return Markup.getMarkup('controls');
  }
}
