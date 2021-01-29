export default class Event {
  constructor(source) {
    this._source = source;
    this._subscribers = [];
  }

  subscribe(subscriber) {
    this._subscribers.push(subscriber);
  }

  unsubscribe(subscriber) {
    this._subscribers.filter(s => s !== subscriber);
  }

  notify(args) {
    this._subscribers.forEach(subscriber => subscriber.call(null, this._source, args));
  }

  broadcast(args, bypass) {
    this._subscribers.forEach(subscriber => {
      if (bypass !== subscriber) {
        subscriber.call(null, this._source, args);
      }
    });
  }

  /**
   * @param {(arg0: this) => any} value
   */
  set source(value) {
    this._source = value;
    return this;
  }
}
