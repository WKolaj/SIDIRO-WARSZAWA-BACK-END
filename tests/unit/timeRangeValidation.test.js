const {
  checkTimeRangeString
} = require("../../middleware/validation/timeRange");

describe("timeRange validation", () => {
  describe("checkTimeRangeString", () => {
    let dateString;

    beforeEach(() => {
      dateString = new Date(Date.now()).toISOString();
    });

    let exec = () => {
      return checkTimeRangeString(dateString);
    };

    it("should return true if given date string is valid", () => {
      let result = exec();

      expect(result).toEqual(true);
    });

    it("should return false if date is undefined", () => {
      dateString = undefined;
      let result = exec();

      expect(result).toEqual(false);
    });

    it("should return false if date string is invalid", () => {
      dateString = "abcd1234";
      let result = exec();

      expect(result).toEqual(false);
    });
  });
});
