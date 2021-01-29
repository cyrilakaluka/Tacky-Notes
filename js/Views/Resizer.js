export default class Resizer {
  constructor(host) {
    this.host = host;
    this.parent = host.parentElement;
    this.resizerList = [];
    this.resizerContainer = document.createElement('div');
    this.resizerContainer.classList.add('resizers');
    this.host.append(this.resizerContainer);
    this._createResizers();
  }

  _createResizers() {
    const types = ['Top', 'Bottom', 'Left', 'Right', 'TopLeft', 'BottomRight', 'TopRight', 'BottomLeft'];

    types.forEach(type => {
      const resizer = ResizerFactory.create(type, this.host, this.parent);
      this.resizerList.push(resizer);
      this.resizerContainer.append(resizer.element);
    });
  }

  dispose() {
    this.resizerContainer.remove();
  }
}

const ResizerFactory = (function () {
  // Closure variables
  let startingWidth, startingHeight, offsetX, offsetY;
  let startingLeft, startingRight, startingTop, startingBottom;
  let parentWidth, parentHeight;
  let onResizeInProgressHandler, onResizeEndHandler, onMouseLeaveHandler;

  function addEventListeners(element, callback) {
    element.addEventListener('mousedown', callback);
    element.addEventListener('dragstart', e => e.preventDefault());
  }

  function createResizerElement(classList) {
    const element = document.createElement('div');
    element.classList.add('resizer');
    classList.forEach(item => element.classList.add(item));
    return element;
  }

  function onResizeStart(event) {
    setClosureVariables.call(this, event);

    this.parent.addEventListener('mousemove', (onResizeInProgressHandler = event => this.resize(event)));

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

    ({ width: parentWidth, height: parentHeight } = this.parent.getBoundingClientRect());

    ({ clientX: offsetX, clientY: offsetY } = event);
  }

  function addMouseupEventListener() {
    this.parent.addEventListener(
      'mouseup',
      (onResizeEndHandler = () => {
        this.parent.removeEventListener('mousemove', onResizeInProgressHandler);
        this.parent.removeEventListener('mouseup', onResizeEndHandler);
        this.parent.removeEventListener('mouseleave', onMouseLeaveHandler);
      })
    );
  }

  function addMouseLeaveEventListener() {
    this.parent.addEventListener(
      'mouseleave',
      (onMouseLeaveHandler = () => {
        this.parent.removeEventListener('mousemove', onResizeInProgressHandler);
        this.parent.removeEventListener('mouseup', onResizeEndHandler);
        this.parent.removeEventListener('mouseleave', onMouseLeaveHandler);
      })
    );
  }

  class Resizer {
    constructor(host, parent, classList) {
      this.host = host;
      this.parent = parent;
      this.element = createResizerElement(classList);
      addEventListeners(this.element, this._onResizeStart);
    }

    _onResizeStart = event => {
      onResizeStart.call(this, event);
    };

    _resizeToTop(event) {
      this.host.style.height = `${offsetY + startingHeight - event.clientY}px`;
      this.host.style.bottom = `${parentHeight - startingBottom}px`;
      this.host.style.top = 'initial';
      return this;
    }

    _resizeToRight(event) {
      this.host.style.width = `${event.clientX - offsetX + startingWidth}px`;
      this.host.style.left = `${startingLeft}px`;
      this.host.style.right = 'initial';
      return this;
    }

    _resizeToBottom(event) {
      this.host.style.height = `${event.clientY - offsetY + startingHeight}px`;
      this.host.style.top = `${startingTop}px`;
      this.host.style.bottom = 'initial';
      return this;
    }

    _resizeToLeft(event) {
      this.host.style.width = `${offsetX + startingWidth - event.clientX}px`;
      this.host.style.right = `${parentWidth - startingRight}px`;
      this.host.style.left = 'initial';
      return this;
    }
  }

  class Top extends Resizer {
    constructor(host, parent) {
      super(host, parent, ['horizontal', 'top']);
    }

    resize = event => {
      this._resizeToTop(event);
    };
  }

  class Bottom extends Resizer {
    constructor(host, parent) {
      super(host, parent, ['horizontal', 'bottom']);
    }

    resize = event => {
      this._resizeToBottom(event);
    };
  }

  class Left extends Resizer {
    constructor(host, parent) {
      super(host, parent, ['vertical', 'left']);
    }

    resize = event => {
      this._resizeToLeft(event);
    };
  }

  class Right extends Resizer {
    constructor(host, parent) {
      super(host, parent, ['vertical', 'right']);
    }

    resize = event => {
      this._resizeToRight(event);
    };
  }

  class TopLeft extends Resizer {
    constructor(host, parent) {
      super(host, parent, ['edge', 'top-left']);
    }

    resize = event => {
      this._resizeToTop(event)._resizeToLeft(event);
    };
  }

  class BottomRight extends Resizer {
    constructor(host, parent) {
      super(host, parent, ['edge', 'bottom-right']);
    }

    resize = event => {
      this._resizeToBottom(event)._resizeToRight(event);
    };
  }

  class TopRight extends Resizer {
    constructor(host, parent) {
      super(host, parent, ['edge', 'top-right']);
    }

    resize = event => {
      this._resizeToTop(event)._resizeToRight(event);
    };
  }

  class BottomLeft extends Resizer {
    constructor(host, parent) {
      super(host, parent, ['edge', 'bottom-left']);
    }

    resize = event => {
      this._resizeToBottom(event)._resizeToLeft(event);
    };
  }

  function create(type, host, parent) {
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
    return new resizers[type](host, parent);
  }

  return { create };
})();
