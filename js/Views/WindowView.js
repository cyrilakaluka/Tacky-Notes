import AbstractView from './AbstractView.js';

export default class WindowView extends AbstractView {
  constructor() {
    super();
    if (this.constructor === WindowView) {
      throw new Error('Can not instantiate an abstract class!');
    }
  }

  _init() {
    return super._init()._setSavedWindowStyles();
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

  _onGlobalBroadcast = (source, action) => {
    action.call(this);
  };

  /**
   * Element Listeners
   */
  _addWindowMoveEventListener() {
    return this._addEventListener('mousedown', this.titleBar, this._onWindowMoveStart)
      ._addEventListener('mouseup', this.titleBar, this._onWindowMoveEnd)
      ._addEventListener('dragstart', this.titleBar, e => e.preventDefault());
  }

  /**
   * Event handlers
   */

  _onWindowMoveStart(event) {
    if (event.button === 0 && event.target === this.titleBar) {
      const { top, left } = this.window.getBoundingClientRect();
      const shift = { x: event.clientX - left, y: event.clientY - top };

      this.window.parentElement.addEventListener(
        'mousemove',
        (this._onWindowMoveEvent = e => {
          this.parent.style.top = e.clientY - shift.y + 'px';
          this.parent.style.left = e.clientX - shift.x + 'px';
        })
      );

      this.window.parentElement.addEventListener(
        'mouseleave',
        (this._onMouseLeaveParentWindow = () => this._onWindowMoveEnd())
      );
    }
  }

  _onWindowMoveEnd() {
    this.window.parentElement.removeEventListener('mousemove', this._onWindowMoveEvent);
    this.window.parentElement.removeEventListener('mouseleave', this._onMouseLeaveParentWindow);
  }

  /**
   * A function that sets a closed in value to true if the event is 'focusin' else false if 'focusout'. This is to control the execution of the focusInEvent dispatch notifier to run only once till a focusout occurs.
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
}
