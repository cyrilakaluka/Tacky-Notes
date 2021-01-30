import AbstractView from './AbstractView.js';
import ViewDataCache from './ViewDataCache.js';
import Event from '../EventDispatcher.js';
import Helper from '../Helpers.js';
import Markup from './View.Markups.js';

export default class SettingsView extends AbstractView {
  constructor() {
    super();
    this.settings = ViewDataCache.appSettings;
    this.updateSettingsEvent = new Event(this);
    super._init();
  }

  _createParent() {
    this.parent = Helper.createElement('div', 'panel', 'panel--settings');
    this.parent.id = 'settings-panel';
    return this;
  }

  _createChildren() {
    this.parent.innerHTML = this._getParentInnerMarkup();
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
    return Markup.getMarkup('settings');
  }
}
