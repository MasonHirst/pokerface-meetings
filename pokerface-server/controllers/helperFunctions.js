//? Place generic helper functions here

module.exports = {
  averageNumericValues: function (arr) {
    try {
      let sum = 0;
      let count = 0;
      for (let val of arr) {
        const { card } = val;
        if (!isNaN(Number(card)) && card) {
          sum += +card;
          count++;
        }
      }
      if (count === 0) {
        return null; //? or whatever value you want to return if there are no numeric values
      }
      const average = sum / count;
      return parseFloat(average.toFixed(1));
    } catch (error) {
      console.error(error);
    }
  },

  isMoreThanTwoHoursAgo: function (date) {
    try {
      const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000; //? two hours in milliseconds
      const now = new Date();
      const diffInMs = now - date;
      return diffInMs > TWO_HOURS_IN_MS;
    } catch (error) {
      console.error(error);
    }
  },
};
