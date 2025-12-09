const checkIfImageExists = (path, callback) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    if (img.complete) {
      callback(true);
    } else {
      img.onload = () => {
        callback(true);
      };

      img.onerror = () => {
        callback(false);
      };
    }
  });
};

export default checkIfImageExists;