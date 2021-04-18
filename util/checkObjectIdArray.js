const checkObjectIdArray = (val) => {
  if (Array.isArray(val) === true) {
    let test = true;
    const checkForId = new RegExp("^[0-9a-fA-F]{24}$");
    val.map((item) => (test = test && checkForId.test(item)));
    return test;
  } else {
    return false;
  }
};

module.exports = checkObjectIdArray;
