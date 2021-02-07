import Helper from '../../Helpers.js';
const delay = Helper.delay;

/**
 *  Displays a tool tip on a hovered element with attribute 'data-hover'.
 *
 * The mousemove event is added to apply a small delay and latch unto the
 *  position of the mouse pointer stored during this event inside
 * the target element. Here, closure is applied to save the clientX and
 * clientY values of the mouse position as well as the ID of setTimeout for
 * cancellation by the conceal method.
 */

const Tooltip = (function () {
  const mousePosition = { x: -1, y: -1 };
  let offset;
  let timeoutBeforeDisplayId,
    timeoutAfterDisplayId = 0;
  class Tooltip {
    constructor() {
      this.tooltip = Helper.createElement('div', 'tooltip');
      this.tooltip.id = 'tooltip';
    }

    attachTo(host) {
      this.host = host;
      host.append(this.tooltip);
      return this;
    }

    addListenersFrom(parent) {
      this._extractElementsThen(parent, element => {
        element.addEventListener('mouseover', this._delayThenDisplay);
        element.addEventListener('mousemove', this._updateMousePosition);
        element.addEventListener('mouseout', this._clearThenConceal);
        element.addEventListener('click', this._clearThenConceal);
      });
      return this;
    }

    destroyListenersFrom(parent) {
      this._extractElementsThen(parent, element => {
        element.removeEventListener('mouseover', this._delayThenDisplay);
        element.removeEventListener('mousemove', this._updateMousePosition);
        element.removeEventListener('mouseout', this._clearThenConceal);
        element.removeEventListener('click', this._clearThenConceal);
      });
    }

    _display = event => {
      offset = event.target.offsetHeight;
      const innerText = event.target.getAttribute('data-hover');
      const TIMEOUT_TO_CONCEAL = 5000; // Conceal after 5 seconds of display
      // set styling
      this.tooltip.innerText = innerText;
      this.tooltip.style.top = `${this._getPositionVertical()}px`;
      this.tooltip.style.left = `${this._getPositionHorizontal()}px`;
      this.tooltip.classList.add('is-visible');
      this.tooltip.style.zIndex = '99999999';

      timeoutAfterDisplayId = delay(TIMEOUT_TO_CONCEAL).then(this._clearThenConceal);
    };

    _getPositionVertical() {
      const tooltipHeight = this.tooltip.offsetHeight;
      const displayLimits = tooltipHeight + offset;
      if (mousePosition.y < displayLimits) {
        return mousePosition.y + offset;
      }
      return mousePosition.y - offset;
    }

    _getPositionHorizontal() {
      // Consideration - tooltip is being transformed to center in css
      const { width: hostWidth } = this.host.getBoundingClientRect();
      const tooltipWidth = this.tooltip.offsetWidth;
      const displayLimits = tooltipWidth * 0.5;
      if (mousePosition.x < displayLimits) {
        return displayLimits;
      } else if (hostWidth - mousePosition.x < displayLimits) {
        return hostWidth - displayLimits;
      }
      return mousePosition.x;
    }

    _clearThenConceal = () => {
      const TIMEOUT_TO_DISAPPEAR = 100;
      // clear timeouts
      clearTimeout(timeoutBeforeDisplayId);
      clearTimeout(timeoutAfterDisplayId);
      // set styling
      this.tooltip.classList.remove('is-visible');
      this.tooltip.style.zIndex = '-99999999';
      this.tooltip.innerText = '';
    };

    _delayThenDisplay = event => {
      const MOUSE_OVER_EVENT_DELAY = 100; // delay after trigger of mouseover
      timeoutBeforeDisplayId = delay(MOUSE_OVER_EVENT_DELAY).then(this._display, event);
    };

    _updateMousePosition = event => {
      mousePosition.x = event.clientX;
      mousePosition.y = event.clientY;
    };

    _extractElementsThen(parent, callback) {
      const elements = parent.querySelectorAll('[data-hover]');
      elements.forEach(element => callback(element));
    }
  }

  return Tooltip;
})();

export default Tooltip;
