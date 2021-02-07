import Event from '../EventDispatcher.js';

export default class EditorContent {
  constructor(contenteditable) {
    this.contenteditable = contenteditable;
    this.treeWalker = document.createTreeWalker(this.contenteditable);
    this.ctrlKeyComboRegistry = {};
    this.shared = {};
    this._init();
  }

  /**
   * Initializers
   */
  _init() {
    this._createSharedMembers()
      ._addLiveSelectionByMouseListener()
      ._addLiveSelectionByKeyboardListener()
      ._addSelectionCollapsedListener()
      ._addDoubleClickSelectionListener()
      ._addCtrlKeyComboListener();
  }

  _createSharedMembers() {
    this.shared = (() => {
      const getTreeWalker = this._getTreeWalker.bind(this);

      const events = {
        userLiveSelectionActive: new Event(this),
        userLiveSelectionEnded: new Event(this),
        userSelectionCollapsed: new Event(this),
      };

      const selection = {
        active: false,
        anchorNode: null,
        focusNode: null,
        firstNode: null,
        text: '',
      };

      const registerKeyCombo = this._registerKeyCombo.bind(this);

      const setContentToFocus = this._setContentToFocus.bind(this);

      const caretPosition = this._caretPosition;

      return { getTreeWalker, events, selection, registerKeyCombo, setContentToFocus, caretPosition };
    })();
    return this;
  }

  /**
   * Add Event Listeners
   */
  _addLiveSelectionByMouseListener() {
    this.contenteditable.addEventListener('mousedown', event => {
      if (event.button === 0) {
        this.contenteditable.addEventListener(
          'mousemove',
          (this._mouseMoveLiveSelection = () => this._onUserSelectionInProgress())
        );
      }
    });

    this.contenteditable.addEventListener('mouseup', event => {
      if (event.button === 0) {
        this._onUserSelectionByMouseEnd();
      }
    });

    return this;
  }

  _addLiveSelectionByKeyboardListener() {
    this.contenteditable.addEventListener('keydown', event => {
      if (this._isDirectionKey(event)) {
        if (event.shiftKey) {
          this._onUserSelectionInProgress();
        }
        this._onUserSelectionCollapsed();
      }
    });

    this.contenteditable.addEventListener(
      'keyup',
      (this.keyUpLiveSelection = () => this._onUserSelectionByKeyboardEnd())
    );
    return this;
  }

  _addSelectionCollapsedListener() {
    this.contenteditable.addEventListener('click', () => {
      this._onUserSelectionCollapsed();
    });
    return this;
  }

  _addCtrlKeyComboListener() {
    this.contenteditable.addEventListener('keydown', event => {
      if (event.ctrlKey && this.ctrlKeyComboRegistry[event.key]) {
        event.preventDefault();
        this.ctrlKeyComboRegistry[event.key]();
      }
    });
    return this;
  }

  _addDoubleClickSelectionListener() {
    this.contenteditable.addEventListener('dblclick', () => {
      if (this._contentHasSelection()) {
        this._onUserSelectionEnd();
      }
    });
    return this;
  }

  /**
   * Event Callback Methods
   */
  _onUserSelectionInProgress() {
    if (this._contentHasSelection()) {
      this._selectionTracking.track();
      if (this._selectionTracking.hasChanged()) {
        this.shared.events.userLiveSelectionActive.notify(this.shared.selection);
      }
    }
  }

  _onUserSelectionByMouseEnd() {
    this.contenteditable.removeEventListener('mousemove', this._mouseMoveLiveSelection);

    if (this._contentHasSelection()) {
      this._onUserSelectionEnd();
    }
  }

  _onUserSelectionByKeyboardEnd() {
    if (this._contentHasSelection()) {
      this._onUserSelectionEnd();
    }
  }

  _onUserSelectionEnd() {
    this._selectionTracking.track();
    this.shared.events.userLiveSelectionEnded.notify(this.shared.selection);
    this._selectionTracking.reset();
  }

  _onUserSelectionCollapsed() {
    const handler = () => {
      if (this._getSelection().isCollapsed) {
        this.shared.selection.active = false;
        this.shared.events.userSelectionCollapsed.notify();
      }
    };
    setTimeout(handler, 0);
  }

  /**
   * Helper Methods
   */
  _contentHasSelection() {
    return !this._getSelection().isCollapsed;
  }

  _getSelection() {
    if (window.getSelection) {
      return window.getSelection();
    } else if (document.getSelection) {
      return document.getSelection();
    } else if (document.selection) {
      return document.selection.createRange();
    }
    return null;
  }

  _getFirstSelectionNode(selection) {
    if (selection) {
      this.treeWalker.currentNode = this.treeWalker.root;
      let nextNode = null;

      do {
        nextNode = this.treeWalker.nextNode();

        if (nextNode === selection.anchorNode) {
          return selection.anchorNode;
        } else if (nextNode === selection.focusNode) {
          return selection.focusNode;
        }
      } while (nextNode);
    }
    return null;
  }

  _isDirectionKey(event) {
    const key = event.which || event.keyCode;

    return key === 38 || key === 40 || key === 37 || key === 39;
  }

  _selectionTracking = (() => {
    let prevSelString = '';
    let selection = null;

    function getSelectionString(selection) {
      return selection ? selection.toString() : '';
    }

    const track = () => {
      selection = this._getSelection();
      this._updateSharedSelectionState(selection);
    };

    const reset = () => {
      selection = null;
      prevSelString = '';
    };

    const hasChanged = () => {
      const current = getSelectionString(selection);
      const previous = prevSelString;
      prevSelString = current;
      return current !== previous;
    };

    return { track, reset, hasChanged };
  })();

  _updateSharedSelectionState(selection) {
    this.shared.selection.active = true;
    this.shared.selection.anchorNode = selection.anchorNode;
    this.shared.selection.focusNode = selection.focusNode;
    this.shared.selection.firstNode = this._getFirstSelectionNode(selection);
    this.shared.selection.text = selection.toString();
  }

  /**
   * Shared member methods
   */

  _getTreeWalker() {
    this.treeWalker.currentNode = this.treeWalker.root;
    return this.treeWalker;
  }

  _registerKeyCombo(key, callback) {
    if (key && typeof callback === 'function') {
      this.ctrlKeyComboRegistry[key] = callback;
    }
  }

  _setContentToFocus() {
    this.contenteditable.focus();
  }

  _caretPosition = (() => {
    let anchorOffset;

    const save = () => {
      const selection = this._getSelection();
      if (selection.type.toLowerCase() === 'caret') {
        ({ anchorOffset } = selection);
      }
    };

    const restore = () => {
      const selection = this._getSelection();
      const { anchorNode } = selection;
      selection.setBaseAndExtent(anchorNode, 0, anchorNode, anchorOffset);
      selection.collapse(anchorNode, anchorOffset);
    };

    return { save, restore };
  })();
}
