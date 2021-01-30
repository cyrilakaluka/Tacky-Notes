import AbstractView from './AbstractView.js';
import ViewDataCache from './ViewDataCache.js';
import Resizer from './Tools/Resizer.js';
import Mover from './Tools/Mover.js';

export default class WindowView extends AbstractView {
  constructor() {
    super();
    if (this.constructor === WindowView) {
      throw new Error('Can not instantiate an abstract class!');
    }

    this.globalBroadcastEvent = ViewDataCache.globalBroadcastEvent;
  }

  _init() {
    return super._init()._setSavedWindowStyles()._initializeTools();
  }

  _subscribeEvents() {
    this.globalBroadcastEvent.subscribe(this._onGlobalBroadcast);
    return this;
  }

  _setSavedWindowStyles() {
    // Apply CSS Styling
    for (let key in this.style) {
      this.parent.style[key] = this.style[key];
    }
    // Compute and assign position if centered property is true
    if (this.centered) {
      const { top, left } = this._getCenterCoordinates();
      this.parent.style.top = `${top}px`;
      this.parent.style.left = `${left}px`;
    }
    return this;
  }

  _initializeTools() {
    this.resizer = new Resizer().attachTo(this.parent).setCallback(this._onResizerCallback.bind(this));

    this.winMover = new Mover(this.parent, this.titleBar).setCallback(this._onWindowMoverCallback.bind(this)).run();
    return this;
  }

  /**
   * Event handlers/ callbacks
   */

  _onGlobalBroadcast = (source, action) => {
    if (action && typeof action === 'function') {
      action.call(this);
    }
  };

  _onResizerCallback() {
    this._updatePosition()._updateDimension()._notifyUpdate();
  }

  _onWindowMoverCallback() {
    this._updatePosition()._updateCentered(false)._notifyUpdate();
  }

  /**
   * A function that sets a closed in value to true if the event is 'focusin'
   * else false if 'focusout'. This is to control the execution of the
   * focusInEvent dispatch notifier to run only once till a focusout occurs.
   */
  _onFocusInOrOut = (() => {
    let firstRun = true;

    return event => {
      if (event.type === 'focusin' && firstRun) {
        firstRun = false;
        return false;
      } else if (event.type === 'focusout') {
        firstRun = true;
      }
      return true;
    };
  })();

  _getCenterCoordinates() {
    // Get body bounding rect as a reference and extract width and height values
    const { width: bodyWidth, height: bodyHeight } = document.body.getBoundingClientRect();
    const thisWidth = +this.style.width.replace('px', '');
    const thisHeight = +this.style.height.replace('px', '');

    return {
      top: bodyHeight * 0.5 - thisHeight * 0.5,
      left: bodyWidth * 0.5 - thisWidth * 0.5,
    };
  }

  /**
   * Public methods
   */
  display() {
    if (this.status === 'open') {
      this.parent.style.display = 'flex';
      this.parent.classList.add('is-visible');
    }
  }

  conceal() {
    this.parent.classList.remove('is-visible');
    setTimeout(() => (this.parent.style.display = 'none'), 1000);
  }

  /**
   * Abstract methods
   */
  _updatePosition() {
    throw new Error('Abstract method must be implemented in concrete object');
  }

  _updateDimension() {
    throw new Error('Abstract method must be implemented in concrete object');
  }

  _notifyUpdate() {
    throw new Error('Abstract method must be implemented in concrete object');
  }
}
