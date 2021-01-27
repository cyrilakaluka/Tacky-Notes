const Helper = (function () {
  function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
  }

  function createElement(tag, ...classes) {
    const element = document.createElement(tag);

    if (classes) {
      element.classList.add(...classes);
    }

    return element;
  }

  function isEmptyObject(object) {
    return object && Object.keys(object).length === 0 && object.constructor === Object;
  }

  const addSelfDestructingEventListener = (element, eventType, callback) => {
    const handler = event => {
      callback(event);
      element.removeEventListener(eventType, handler);
    };
    element.addEventListener(eventType, handler);
  };

  return {
    htmlToElement,
    createElement,
    isEmptyObject,
    addSelfDestructingEventListener,
  };
})();

export default Helper;
