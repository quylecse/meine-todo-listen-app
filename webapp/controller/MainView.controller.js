sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend(
      "com.example.meinetodolistenapp.controller.MainView",
      {
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
        onSearch: function (oEvent) {
          const sInput =
            oEvent.getParameter("query") || oEvent.getParameter("newValue");

          const oTitleFilter = new Filter(
            "TITLE",
            FilterOperator.Contains,
            sInput,
          );
          const oTable = this.byId("todoTable");
          const oBinding = oTable.getBinding("items");

          if (!oBinding) {
            return;
          }

          if (sInput) {
            const oFilter = new Filter(
              "TITLE",
              FilterOperator.Contains,
              sInput,
            );
            oBinding.filter([oFilter]);
          } else {
            oBinding.filter([]);
          }
        },
        formatStatusText: function (sTextKey) {
          if (!sTextKey) {
            return "";
          }
          var oResourceBundle = this.getView()
            .getModel("i18n")
            .getResourceBundle();
          return oResourceBundle.getText(sTextKey);
        },
        onStatusChange: function (oEvent) {
          const sSelectedStatus = oEvent.getParameter("selectedItem").getKey();
          console.log("Selected Status:", sSelectedStatus);
          this.onStatusSearch(sSelectedStatus); //
        },
        onStatusSearch: function (sStatus) {
          const oTable = this.byId("todoTable");
          const oBinding = oTable.getBinding("items");

          if (!oBinding) {
            return;
          }

          if (sStatus && sStatus !== "" && sStatus !== "All") {
            const oFilter = new Filter("STATUS", FilterOperator.EQ, sStatus);
            oBinding.filter(oFilter);
          } else {
            oBinding.filter([]);
          }
        },
      },
    );
  },
);
