module.exports.checkTimeRangeString = dateString => {
  let date = new Date(dateString);
  if (isNaN(date.getMonth())) {
    return false;
  } else {
    return true;
  }
};

module.exports.validateTimeRange = req => {
  if (!module.exports.checkTimeRangeString(req.query.from))
    return "from has to be a valid date string!";
  if (!module.exports.checkTimeRangeString(req.query.to))
    return "to has to be a valid date string!";

  let dateFrom = new Date(req.query.from);
  let dateTo = new Date(req.query.to);

  if (dateFrom >= dateTo) {
    return "date from cannot be larger or equal date to!";
  }
};
