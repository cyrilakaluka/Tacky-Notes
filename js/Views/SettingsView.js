import AbstractView from './AbstractView.js';
import ViewDataCache from './ViewDataCache.js';
import Event from '../EventDispatcher.js';
import Helper from '../Helpers.js';

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
