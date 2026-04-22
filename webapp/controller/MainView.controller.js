sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/Configuration",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (
    Controller,
    Filter,
    FilterOperator,
    Sorter,
    Configuration,
    Fragment,
    MessageToast,
    MessageBox,
  ) {
    "use strict";

    return Controller.extend(
      "com.example.meinetodolistenapp.controller.MainView",
      {
        onInit: function () {
          const oFormModel = new sap.ui.model.json.JSONModel({
            TITLE: "",
            DESCRIPTION: "",
            DUE_DATE: null,
            STATUS: "",
          });
          this.getView().setModel(oFormModel, "createTodoForm");
        },

        /**
         * ===================================================
         * ACTIONS CONTROLLER
         * - Todo suchen
         * - Status ausfiltern
         * ===================================================
         */
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
        onStatusChange: function (oEvent) {
          const selectedStatus = oEvent.getSource().getSelectedKey();
          this.onStatusSearch(selectedStatus); //
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
        onSortChange: function (oEvent) {
          //sort key ausholen
          const sortKey = oEvent.getSource().getSelectedKey();
          //console.log(sortKey);
          // console.log("ausgewählte Kriterium: " + sortKey);
          if (!sortKey) return;

          let isAscending = sortKey.includes("Asc") ? true : false;
          let sortBy = "";
          if (sortKey.includes("date")) {
            sortBy = "DUE_DATE";
          } else if (sortKey.includes("title")) {
            sortBy = "TITLE";
          }

          const oSorter = new Sorter(sortBy, !isAscending);
          //console.log("sort by: " + sortBy);
          let oTable = this.byId("todoTable");
          // 2. Thêm kiểm tra an toàn để tránh lỗi Crash khi bảng chưa có dữ liệu
          let oBinding = oTable ? oTable.getBinding("items") : null;
          if (oBinding) {
            oBinding.sort(oSorter);
          }
        },
        onLanguageChange: function (oEvent) {
          const selectedLanguage = oEvent.getSource().getSelectedKey();

          //console.log("Key: ", selectedLanguage);

          // Sprache einstellen
          if (selectedLanguage) {
            Configuration.setLanguage(selectedLanguage);
          }
        },
        onOpenCreateDialog: function (oEvent) {
          console.log("Add button Clicked");
          if (!this.oCreateTodoDialog) {
            this.loadFragment({
              name: "com.example.meinetodolistenapp.view.fragments.toolbar.CreateToDoDialog",
            }).then((res) => {
              this.oCreateTodoDialog = res;
              this.getView().addDependent(this.oCreateTodoDialog);
              this.oCreateTodoDialog.open();
            });
          } else {
            this.oCreateTodoDialog.open();
          }
        },
        onCloseCreateDialog: function () {
          if (this.oCreateTodoDialog) {
            this.oCreateTodoDialog.close();
          }
        },
        onSaveTask: function (oEvent) {
          // hole die leere Form;
          const oFormModel = this.getView().getModel("createTodoForm");

          // Hele alle Daten aus Form-Eingabe
          const oNewTodoData = oFormModel.getData();

          if (!oNewTodoData.TITLE || oNewTodoData.TITLE.trim() === "") {
            MessageBox.error("Title ist erforderlich");
            return;
          }
          // hole die Default Odata Model
          const oODataModel = this.getView().getModel();
          oODataModel.create("/Todo", oNewTodoData, {
            success: (oData, oResponse) => {
              MessageToast.show("Todo gespeichert");
              this.onCloseCreateDialog();
              oODataModel.refresh();
              oFormModel.setData({
                TITLE: "",
                DESCRIPTION: "",
                DUE_DATE: null,
                STATUS: "",
              });
            },
            error: (oError) => {
              console.error("Error Create Todo", oError);
              MessageBox.error("System Error: " + oError.message);
            },
          });
        },
        /**
         * ===================================================
         * HILFSFUNKTIONEN
         * - Formatter für Texte
         * - Status-Definitionen
         * ===================================================
         */
        formatSortOptionText: function (sortTextKey) {
          if (!sortTextKey) {
            return "";
          }
          let oResourceBundle = this.getView()
            .getModel("i18n")
            .getResourceBundle();
          return oResourceBundle.getText(sortTextKey);
        },
        formatStatusText: function (statusTextKey) {
          if (!statusTextKey) {
            return "";
          }
          let oResourceBundle = this.getView()
            .getModel("i18n")
            .getResourceBundle();
          return oResourceBundle.getText(statusTextKey);
        },
        formatDate: function (sDate) {
          //check null
          if (!sDate || sDate === undefined || sDate === null) return "";

          const date = sDate instanceof Date ? sDate : new Date(sDate);
          return new Intl.DateTimeFormat(navigator.language, {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }).format(date);
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
      },
    );
  },
);
