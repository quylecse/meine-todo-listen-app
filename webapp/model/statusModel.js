sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";

  return {
    createStatusModel: function () {    

      return new JSONModel({
        selectedStatus: "All",
        StatusList: [
          { key: "Pending", textKey: "selectStatus.pending" },
          { key: "In Progress", textKey: "selectStatus.inProgress" },
          { key: "Completed", textKey: "selectStatus.completed" },
          { key: "All", textKey: "selectStatus.all" },
        ],
      });
    },
  };
});
