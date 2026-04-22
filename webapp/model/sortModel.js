sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";

  return {
    createSortOption: function () {
      return new JSONModel({
        selectedSortOption: "dateDesc",
        sortOptions: [
          { key: "dateAsc", text: "selectSortOption.dateAsc" },
          { key: "dateDesc", text: "selectSortOption.dateDesc" },
          { key: "titleAsc", text: "selectSortOption.titleAsc" },
          { key: "titleDesc", text: "selectSortOption.titleDesc" },
        ],
      });
    },
  };
});
