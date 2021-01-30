const Mover = (function () {
  /**
   * Closure (aka backpack) variables
   */
  let refHeight, refWidth;
  let hostWidth, hostHeight;
  let shiftValue = { x: -1, y: -1 };
  let mouseMoveEventHandler, mouseUpEventHandler, mouseLeaveEventHandler;

  class Mover {
    constructor(host, target) {
      this.host = host;
      this.target = target;
      this.reference = document.body;
      this.callback = null;
    }

    run() {
      if (this.target) {
        this.target.addEventListener('mousedown', this._onMoveStart.bind(this));
        this.target.addEventListener('dragstart', e => e.preventDefault());
      } else {
        console.error('Move target is not defined');
      }
      return this;
    }

    setCallback(callback) {
      this.callback = callback;
      return this;
    }

    _onMoveStart(event) {
      if (this.host.parentElement) {
        this.reference = this.host.parentElement;
      }

      if (event.button === 0 && event.target === this.target) {
        this._setClosureVariables(event)
          ._addMouseMoveEventListener()
          ._addMouseUpEventListener()
          ._addMouseLeaveEventListener();
      }
    }

    _onMoveInProgress(event) {
      const top = event.clientY - shiftValue.y;
      const left = event.clientX - shiftValue.x;

      if (top > 0 && top + hostHeight < refHeight) this.host.style.top = top + 'px';

      if (left > 0 && left + hostWidth < refWidth) this.host.style.left = left + 'px';
    }

    _onMoveEnd() {
      this.reference.removeEventListener('mousemove', mouseMoveEventHandler);
      this.reference.removeEventListener('mouseleave', mouseUpEventHandler);
      this.reference.removeEventListener('mouseup', mouseLeaveEventHandler);
      if (this.callback && typeof this.callback === 'function') {
        this.callback();
      }
    }

    _setClosureVariables(event) {
      const { top, left, width, height } = this.host.getBoundingClientRect();
      const { width: rWidth, height: rHeight } = this.reference.getBoundingClientRect();
      hostWidth = width;
      hostHeight = height;
      refWidth = rWidth;
      refHeight = rHeight;
      shiftValue = { x: event.clientX - left, y: event.clientY - top };
      return this;
    }

    _addMouseMoveEventListener() {
      this.reference.addEventListener('mousemove', (mouseMoveEventHandler = event => this._onMoveInProgress(event)));
      return this;
    }

    _addMouseUpEventListener() {
      this.reference.addEventListener('mouseup', (mouseUpEventHandler = () => this._onMoveEnd()));
      return this;
    }

    _addMouseLeaveEventListener() {
      this.reference.addEventListener('mouseleave', (mouseLeaveEventHandler = () => this._onMoveEnd()));
      return this;
    }
  }

  return Mover;
})();

export default Mover;
