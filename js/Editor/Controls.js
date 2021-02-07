class FormatControl {
  constructor(command, button, key, commandTag, content) {
    this.command = command;
    this.button = button;
    this.key = key;
    this.commandTag = commandTag;
    this.sharedContent = content;
    this.status = 'inactive';
    this._init();
  }

  /**
   * Initializers
   */
  _init() {
    this._addEventListener()._registerCallbacks();
  }

  _addEventListener() {
    this.button.addEventListener('click', this._onClickEvent);
    return this;
  }

  _registerCallbacks() {
    this.sharedContent.events.userLiveSelectionActive.subscribe(this._onUserSelection.bind(this));
    this.sharedContent.events.userLiveSelectionEnded.subscribe(this._onUserSelection.bind(this));
    this.sharedContent.events.userSelectionCollapsed.subscribe(this._onUserSelectionCollapsed.bind(this));
    this.sharedContent.registerKeyCombo(this.key, this._onKeyComboEvent);
    return this;
  }

  /**
   * Event handlers
   */
  _onClickEvent = () => this._execute();

  _onKeyComboEvent = () => this._execute();

  _onUserSelection(sender, selection) {
    // Check if command tag is applied on first selection node
    const result = this._cmdAppliedInFirstSelection(selection);

    if (result === null) return;

    this._status = result ? 'active' : 'inactive';
  }

  _onUserSelectionCollapsed() {
    this._status = this._cmdApplied() ? 'active' : 'inactive';
  }

  /**
   * Core methods
   */
  _execute() {
    this._runExecCommand();

    const selectionActive = this.sharedContent.selection.active;
    const statusActive = this._status === 'active';

    if (selectionActive && statusActive && this._cmdApplied()) {
      this._runExecCommand();
    }

    this._status = this._status === 'active' ? 'inactive' : 'active';

    this.sharedContent.setContentToFocus();
  }

  _runExecCommand() {
    document.execCommand(this.command);
  }

  set _status(value) {
    this.status = value;
    this.button.setAttribute('data-status', this.status);
  }

  get _status() {
    return this.status;
  }

  _cmdAppliedInFirstSelection(selection) {
    const treeWalker = this.sharedContent.getTreeWalker();
    // Traverse the DOM tree to the first selection node
    let nextNode = null;
    do {
      nextNode = treeWalker.nextNode();
    } while (nextNode && nextNode !== selection.firstNode);

    if (!nextNode) {
      return null;
    }
    // TRaverse up to check that the command tag is present
    const notRoot = () => treeWalker.parentNode() !== treeWalker.root;
    const isCommandTag = () => treeWalker.currentNode.tagName === this.commandTag;

    while (notRoot()) {
      if (isCommandTag()) {
        return true;
      }
    }
    return false;
  }

  _cmdApplied() {
    return document.queryCommandState(this.command);
  }
}

class Bold extends FormatControl {
  constructor(button, sharedContent) {
    super('bold', button, 'b', 'B', sharedContent);
    super._init();
  }
}

class Italic extends FormatControl {
  constructor(button, sharedContent) {
    super('italic', button, 'i', 'I', sharedContent);
    super._init();
  }
}

class Underline extends FormatControl {
  constructor(button, sharedContent) {
    super('underline', button, 'u', 'U', sharedContent);
    super._init();
  }
}

class StrikeThrough extends FormatControl {
  constructor(button, sharedContent) {
    super('strikeThrough', button, null, 'STRIKE', sharedContent);
    super._init();
  }
}

class BulletList extends FormatControl {
  constructor(button, sharedContent) {
    super('insertUnorderedList', button, 'l', 'UL', sharedContent);
    super._init();
  }

  /**
   * Override of execute method
   */
  _execute() {
    this.sharedContent.caretPosition.save();

    super._execute();

    if (!this.sharedContent.selection.active) {
      this.sharedContent.caretPosition.restore();
    }
  }
}

export default { Bold, Italic, Underline, StrikeThrough, BulletList };
