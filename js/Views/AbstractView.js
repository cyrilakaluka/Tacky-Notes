export default class AbstractView {
  constructor() {
    if (this.constructor === AbstractView) {
      throw new Error('Can not instantiate an abstract class!');
    }
  }

  _init() {
    return this._createParent()._createChildren()._initEvents()._subscribeEvents();
  }

  _subscribeEvents() {
    return this;
  }

  /**
   * Notify Event handler
   */
  _notifyHandler(event, callback, notifier, data) {
    if (callback) {
      if (callback.call(this, event)) {
        return;
      }
    }
    notifier = notifier instanceof Array ? notifier : [notifier];
    data = data instanceof Array ? data : [data];

    notifier.forEach((n, idx) => {
      n.notify(data[idx]);
    });
  }

  /**
   *
   * @param {String} type - The type of event e.g 'click', 'change' etc
   * @param {HTMLElement} element - The HTML Element to listen to event
   * @param {Function} handler - The function that handles the DOM event. The DOM event will be supplied  as the first parameter to the handler
   * @param {Function} callback - Optional: The function to run prior to event notification. If provided, the DOM event parameter will be called with this function instead
   * @param {Event} notifier - Optional: The event dispatch notifier
   * @param {any} data - Optional: The data to set as parameter when notifier's notify method is called
   * @returns {this} this - The caller's object reference
   */
  _addEventListener(type, element, handler, callback, notifier, data) {
    element.addEventListener(type, event => {
      handler.call(this, event, callback, notifier, data);
    });
    return this;
  }

  /***
   * Helper methods
   */
  _getElement(selector) {
    return this.parent.querySelector(selector);
  }

  _getAllElements(selector) {
    return this.parent.querySelectorAll(selector);
  }

  /**
   * Abstract methods - Implementation in concrete object required
   */
  _createParent() {
    throw new Error('This method must be implemented in concrete object');
  }

  _createChildren() {
    throw new Error('This method must be implemented in concrete object');
  }

  _initEvents() {
    throw new Error('This method must be implemented in concrete object');
  }

  _getParentInnerMarkup() {
    throw new Error('This method must be implemented in concrete object');
  }
}
