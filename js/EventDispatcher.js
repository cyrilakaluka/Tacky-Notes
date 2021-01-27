export default class Event {
  constructor(source) {
    this._source = source;
    this._subscribers = [];
  }

  subscribe(subscriber) {
    this._subscribers.push(subscriber);
  }

  notify(args) {
    if (this._subscribers.length === 0) return;

    this._subscribers.forEach(subscriber => subscriber.call(null, this._source, args));
  }

  /**
   * @param {(arg0: this) => any} value
   */
  set source(value) {
    this._source = value;
    return this;
  }
}
