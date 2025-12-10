const setNativeValue = (element, value) => {
  
  if(!element) {
    return;
  }

  let lastValue = element.value;
  
  element.value = value;

  // @ts-ignore - Event constructor target property issue
  let event = new Event("input", { target: element, bubbles: true });

  let tracker = element._valueTracker;

  if (tracker) {
      tracker.setValue(lastValue);
  }

  element.dispatchEvent(event);

}

export default setNativeValue;