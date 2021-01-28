import Helper from '../Helpers.js';
const applyDelay = Helper.delay;

class ContextMenu {
  constructor(event, config, callback) {
    this.root = document.body;
    this.callback = callback;
    this.event = event;
    this.config = config;
  }

  run() {
    if (this.event.type !== 'contextmenu') return;

    this._init()._setMenuPosition()._display();
  }

  _init() {
    this.parent = Helper.createElement('div', 'context-menu');
    this.parent.id = 'context-menu';
    this.parent.style.zIndex = '-999999999';
    this.components = this._getComponents();
    this.parent.append(...this.components.map(c => c.element));
    this.root.append(this.parent);
    this._initializeListeners();
    return this;
  }

  _setMenuPosition() {
    const offSet = 5;
    const menuBR = this.parent.getBoundingClientRect();
    const rootBR = this.root.getBoundingClientRect();
    const targetSize = { width: menuBR.width + offSet, height: menuBR.height + offSet };
    const rootSize = { width: rootBR.width, height: rootBR.height };
    const eventCoordinate = { x: this.event.clientX, y: this.event.clientY };
    const spaceExistsRight = rootSize.width - eventCoordinate.x > targetSize.width;
    const spaceExistsBottom = rootSize.height - eventCoordinate.y > targetSize.height;
    const spaceExistsLeft = eventCoordinate.x > targetSize.width;
    const spaceExistsTop = eventCoordinate.y > targetSize.height;

    if (spaceExistsBottom && spaceExistsRight) {
      this.position = { x: this.event.clientX, y: this.event.clientY };
    } else if (spaceExistsBottom && spaceExistsLeft) {
      this.position = { x: this.event.clientX - menuBR.width, y: this.event.clientY };
    } else if (spaceExistsTop && spaceExistsLeft) {
      this.position = { x: this.event.clientX - menuBR.width, y: this.event.clientY - menuBR.height };
    } else if (spaceExistsTop && spaceExistsRight) {
      this.position = { x: this.event.clientX, y: this.event.clientY - menuBR.height };
    } else {
      this.position = { x: -rootBR.width, y: -rootBR.height };
    }
    return this;
  }

  _display() {
    this.parent.style.left = `${this.position.x}px`;
    this.parent.style.top = `${this.position.y}px`;
    this.parent.style.zIndex = '999999999';
    this.parent.classList.add('is-visible');
    return this;
  }

  _destroy() {
    this.parent.classList.remove('is-visible');
    this.components.forEach(component => {
      component.element.removeEventListener('click', this.callback);
      component.element.remove();
    });
    this.parent.remove();
  }

  _initializeListeners() {
    this.components.forEach(component => {
      if (component.action) {
        component.element.addEventListener('click', () => {
          this.callback(component.command);
          this._destroy(this.callback);
        });
      }
    });

    this.root.addEventListener('mousedown', this._onMouseDownEvent);
  }

  _onMouseDownEvent = event => {
    if (!event.target.closest(`#${this.parent.id}`)) {
      this._destroy();
    }
    this.root.removeEventListener('mousedown', this._onMouseDownEvent);
  };

  _getComponents() {
    let output = [];
    const components = this.config.components;
    // get the markup for the button component
    components.forEach(component => {
      const command = component.command;
      const text = component.text;
      let action = true;
      if (component.enabled) {
        const markup = this._getParentMarkup(command, text);
        const element = this._htmlToElement(markup);
        if (component.greyed) {
          element.classList.add('greyed');
          action = false;
        }
        output.push({ command, element, action });
      }
    });
    return output;
  }

  _getParentMarkup(name, text) {
    name = name.toLowerCase();
    return `<button class="button">
      <svg class="icon icon--${name}">
      <use href="icons/sprite.svg#${name}"></use>
       </svg>
      <span>${text}</span>
      </button>`.trim();
  }
}

const Tooltip = (function () {
  const mousePosition = { x: -1, y: -1 };
  let timeoutId = 0;
  /**
   *  Displays a tool tip on a hovered element with attribute 'data-hover'.
   *
   * The mousemove event is added to apply a small delay and latch unto the
   *  position of the mouse pointer stored during this event inside
   * the target element. Here, closure is applied to save the clientX and
   * clientY values of the mouse position as well as the ID of setTimeout for
   * cancellation by the conceal method.
   */

  class Tooltip {
    constructor() {
      this.parent = Helper.createElement('div', 'tooltip');
      this.parent.id = 'tooltip';
    }

    _display = event => {
      const offset = event.target.offsetHeight;
      const innerText = event.target.getAttribute('data-hover');
      // set styling
      this.parent.style.top = `${mousePosition.y - offset}px`;
      this.parent.style.left = `${mousePosition.x}px`;
      this.parent.innerText = innerText;
      this.parent.classList.add('is-visible');
      this.parent.style.zIndex = '99999999';
    };

    _clearThenConceal = () => {
      // clear timeouts if display hasn't been executed
      clearTimeout(timeoutId);
      // set styling
      this.parent.classList.remove('is-visible');
      this.parent.style.zIndex = '-99999999';
    };

    _delayThenDisplay = event => {
      const MOUSE_OVER_EVENT_DELAY = 100; // delay after trigger of mouseover
      timeoutId = applyDelay(MOUSE_OVER_EVENT_DELAY).then(this._display, event);
    };

    _updateMousePosition = event => {
      mousePosition.x = event.clientX;
      mousePosition.y = event.clientY;
    };

    _extractElementsThen(parent, callback) {
      const elements = parent.querySelectorAll('[data-hover]');
      elements.forEach(element => callback(element));
    }

    attachTo(parent) {
      parent.append(this.parent);
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
  }

  return Tooltip;
})();

export default { Tooltip, ContextMenu };
