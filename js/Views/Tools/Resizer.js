export default class Resizer {
  constructor() {
    this.host = null;
    this.options = {};
    this.resizerList = [];
    this.resizerContainer = document.createElement('div');
    this.resizerContainer.classList.add('resizers');
  }

  attachTo(host) {
    if (host) {
      this.host = host;
      this.host.append(this.resizerContainer);
      this._createResizers();
    }
    return this;
  }

  setCallback(callback) {
    this.options.callback = callback;
  }

  dispose() {
    this.resizerContainer.remove();
  }

  _createResizers() {
    const types = ['Top', 'Bottom', 'Left', 'Right', 'TopLeft', 'BottomRight', 'TopRight', 'BottomLeft'];

    types.forEach(type => {
      const resizer = ResizerFactory.create(type, this.host, this.options);
      this.resizerList.push(resizer);
      this.resizerContainer.append(resizer.element);
    });
  }
}

const ResizerFactory = (function () {
  /**
   * Closure (aka backpack) variables
   */
  let startingWidth, startingHeight, offsetX, offsetY;
  let startingLeft, startingRight, startingTop, startingBottom;
  let parentWidth, parentHeight;
  let onResizeInProgressHandler, onResizeEndHandler, onMouseLeaveHandler;

  function addEventListeners() {
    this.element.addEventListener('mousedown', this.onResizeStart);
    this.element.addEventListener('dragstart', e => e.preventDefault());
  }

  function createResizerElement(classList) {
    const element = document.createElement('div');
    element.classList.add('resizer');
    classList.forEach(item => element.classList.add(item));
    return element;
  }

  function startResize(event) {
    setClosureVariables.call(this, event);
    addMouseMoveEventListener.call(this);
    addMouseupEventListener.call(this);
    addMouseLeaveEventListener.call(this);
  }

  function setClosureVariables(event) {
    ({
      width: startingWidth,
      height: startingHeight,
      top: startingTop,
      left: startingLeft,
      bottom: startingBottom,
      right: startingRight,
    } = this.host.getBoundingClientRect());

    ({ width: parentWidth, height: parentHeight } = this.reference.getBoundingClientRect());

    ({ clientX: offsetX, clientY: offsetY } = event);
  }

  function addMouseMoveEventListener() {
    this.reference.addEventListener('mousemove', (onResizeInProgressHandler = event => this.actionResize(event)));
  }

  function addMouseupEventListener() {
    this.reference.addEventListener(
      'mouseup',
      (onResizeEndHandler = () => {
        this.reference.removeEventListener('mousemove', onResizeInProgressHandler);
        this.reference.removeEventListener('mouseup', onResizeEndHandler);
        this.reference.removeEventListener('mouseleave', onMouseLeaveHandler);
        this.onResizeEnd();
      })
    );
  }

  function addMouseLeaveEventListener() {
    this.reference.addEventListener(
      'mouseleave',
      (onMouseLeaveHandler = () => {
        this.reference.removeEventListener('mousemove', onResizeInProgressHandler);
        this.reference.removeEventListener('mouseup', onResizeEndHandler);
        this.reference.removeEventListener('mouseleave', onMouseLeaveHandler);
        this.onResizeEnd();
      })
    );
  }

  class Resizer {
    constructor(host, options, classList) {
      this.host = host;
      this.options = options;
      this.reference = document.body;
      this.element = createResizerElement(classList);
      addEventListeners.call(this);
      this.resizeFactor = {};
    }

    onResizeStart = event => {
      this._setHostReference();
      startResize.call(this, event);
    };

    onResizeEnd() {
      // Reset host position reference to top and left
      const { top, left } = this.host.getBoundingClientRect();
      this.host.style.top = top + 'px';
      this.host.style.left = left + 'px';
      this.host.style.bottom = 'initial';
      this.host.style.right = 'initial';
      if (this.options.callback && typeof this.options.callback === 'function') {
        this.options.callback();
      }
    }

    actionResize(event) {
      this._setResizeFactor(event).resize();
    }

    _setHostReference() {
      const reference = this.host.parentElement;
      this.reference = reference ? reference : this.reference;
      return this;
    }

    _setResizeFactor(event) {
      this.resizeFactor.x = event.clientX;
      this.resizeFactor.y = event.clientY;
      return this;
    }

    _resizeToTop() {
      this.host.style.height = `${offsetY + startingHeight - this.resizeFactor.y}px`;
      this.host.style.bottom = `${parentHeight - startingBottom}px`;
      this.host.style.top = 'initial';
      return this;
    }

    _resizeToRight() {
      this.host.style.width = `${this.resizeFactor.x - offsetX + startingWidth}px`;
      this.host.style.left = `${startingLeft}px`;
      this.host.style.right = 'initial';
      return this;
    }

    _resizeToBottom() {
      this.host.style.height = `${this.resizeFactor.y - offsetY + startingHeight}px`;
      this.host.style.top = `${startingTop}px`;
      this.host.style.bottom = 'initial';
      return this;
    }

    _resizeToLeft() {
      this.host.style.width = `${offsetX + startingWidth - this.resizeFactor.x}px`;
      this.host.style.right = `${parentWidth - startingRight}px`;
      this.host.style.left = 'initial';
      return this;
    }
  }

  class Top extends Resizer {
    constructor(host, options) {
      super(host, options, ['horizontal', 'top']);
    }

    resize() {
      this._resizeToTop();
    }
  }

  class Bottom extends Resizer {
    constructor(host, options) {
      super(host, options, ['horizontal', 'bottom']);
    }

    resize() {
      this._resizeToBottom();
    }
  }

  class Left extends Resizer {
    constructor(host, options) {
      super(host, options, ['vertical', 'left']);
    }

    resize() {
      this._resizeToLeft();
    }
  }

  class Right extends Resizer {
    constructor(host, options) {
      super(host, options, ['vertical', 'right']);
    }

    resize() {
      this._resizeToRight();
    }
  }

  class TopLeft extends Resizer {
    constructor(host, options) {
      super(host, options, ['edge', 'top-left']);
    }

    resize() {
      this._resizeToTop()._resizeToLeft();
    }
  }

  class BottomRight extends Resizer {
    constructor(host, options) {
      super(host, options, ['edge', 'bottom-right']);
    }

    resize() {
      this._resizeToBottom()._resizeToRight();
    }
  }

  class TopRight extends Resizer {
    constructor(host, options) {
      super(host, options, ['edge', 'top-right']);
    }

    resize() {
      this._resizeToTop()._resizeToRight();
    }
  }

  class BottomLeft extends Resizer {
    constructor(host, options) {
      super(host, options, ['edge', 'bottom-left']);
    }

    resize() {
      this._resizeToBottom()._resizeToLeft();
    }
  }

  function create(type, host, options) {
    const resizers = {
      Top,
      Bottom,
      Left,
      Right,
      TopLeft,
      BottomRight,
      TopRight,
      BottomLeft,
    };
    return new resizers[type](host, options);
  }

  return { create };
})();
