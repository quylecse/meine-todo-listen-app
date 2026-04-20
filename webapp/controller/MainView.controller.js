sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("meinetodolistenapp.controller.MainView", {
    onInit: function () {},

    formatDate: function (sDate) {
      //check null
      if (!sDate || sDate === undefined || sDate === null) return "";

      //parsing sDate to Date object
      let date;
      const match = /\d+/.exec(sDate); //regex  (cut the number part from the string)" "1717977600000"
      if (!match) return "";

      date = new Date(parseInt(match[0], 10)); // parsing the matched string to an interger then a Date object  // Mon Jun 10 2024
      return new Intl.DateTimeFormat(navigator.language, {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }).format(date); //format the date to the user's locale
    },
    getStatusState: function (sStatus) {
      switch (sStatus) {
        case "Completed":
          return "Success";
        case "In Progress":
          return "Information";
        case "Pending":
          return "Warning";
        default:
          return "Warning";
      }
    },
  });
});
