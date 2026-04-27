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
          //Databucket
          const oFormModel = new sap.ui.model.json.JSONModel({
            TITLE: "",
            DESCRIPTION: "",
            DUE_DATE: null,
            STATUS: "",
          });
          this.getView().setModel(oFormModel, "createTodoForm");

          // path für Edit
          this._sEditPath = null;
          this._oDeleteDialog = null;
          this._aDeletePaths = null;
        },

        /**
         * ===================================================
         * ACTIONS CONTROLLER
         * - Todo suchen
         * - Status ausfiltern
         * - Sprache ändern
         * - Neue Todo hinzufügen
         * - Todo bearbeiten
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
          const oView = this.getView();
          if (oEvent) {
            // wenn Dialog ohne Event (das heißt durch onEdit) geöffnet wird, führt zur Erstellung dann reset input Form
            this._sEditPath = null;
            const oFormModel = oView.getModel("createTodoForm");
            if (oFormModel) {
              oFormModel.setData({
                TITLE: "",
                DESCRIPTION: "",
                DUE_DATE: null,
                STATUS: "",
              });
            }
          }
          // der Title des Dialogs setzen
          const oResourceBundle = this.getView()
            .getModel("i18n")
            .getResourceBundle();
          const sDialogTitle = this._sEditPath
            ? oResourceBundle.getText("dialog.onEditTitle")
            : oResourceBundle.getText("dialog.onCreateTitle");

          const handleOpenDialog = function (oDialog) {
            oDialog.setTitle(sDialogTitle);
            oDialog.open();
          };

          if (!this.oCreateTodoDialog) {
            this.loadFragment({
              name: "com.example.meinetodolistenapp.view.fragments.toolbar.CreateToDoDialog",
            }).then(
              function (oLoadedFragment) {
                this.oCreateTodoDialog = oLoadedFragment;
                oView.addDependent(this.oCreateTodoDialog);
                handleOpenDialog(this.oCreateTodoDialog);
              }.bind(this),
            );
          } else {
            handleOpenDialog(this.oCreateTodoDialog);
          }
        },
        onCloseCreateDialog: function () {
          if (this.oCreateTodoDialog) {
            this._sEditPath = null;
            this.oCreateTodoDialog.close();
          }
        },
        //Save Task für Create und Delete
        onSaveTask: function (oEvent) {
          const oFormModel = this.getView().getModel("createTodoForm"); // hole die Input Form;
          const oRawData = oFormModel.getData(); // Hele alle Daten aus Form-Eingabe
          const oODataModel = this.getView().getModel(); // hole die Default  Odata Service Model
          oODataModel.resetChanges();

          const payload = {
            TITLE: oRawData.TITLE,
            DESCRIPTION: oRawData.DESCRIPTION,
            DUE_DATE: oRawData.DUE_DATE,
            STATUS: oRawData.STATUS,
          };
          // Benutzer Input check
          if (!payload.TITLE || payload.TITLE.trim() === "") {
            MessageBox.error("Title ist erforderlich");
            return;
          }

          //Fallunterscheidung zw. Create und Edit
          if (this._sEditPath) {
            oODataModel.update(this._sEditPath, payload, {
              success: (oDdata, oResponse) => {
                MessageToast.show("Todo aktualisiert");
                this.onCloseCreateDialog();
                oFormModel.setData({
                  TITLE: "",
                  DESCRIPTION: "",
                  DUE_DATE: null,
                  STATUS: "",
                });
                this._sEditPath = null;
              },
              error: (oError) => {
                console.log(oError);
                MessageBox.error("System Error: " + oError.message);
              },
            });
            //path nicht null ? auf Edit : auf Create
          } else {
            oODataModel.create("/Todo", payload, {
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
                this._sEditPath = null;
                console.log("editpath after create: " + this._sEditPath);
              },
              error: (oError) => {
                console.error("Error Create Todo", oError);
                MessageBox.error("System Error: " + oError.message);
              },
            });
          }
        },
        onEditTask: function (oEvent) {
          const oView = this.getView();
          // Context greifen
          const oContext = oEvent.getSource().getBindingContext(); // das ausgewählte Todo
          if (!oContext) return;
          console.log("Edit todo: " + oContext);
          // Daten der Zeile holen
          const oRawDataOnClicked = oContext.getObject();
          //console.log("Data to be edited: ", oRawDataOnClicked);

          const oFormModel = oView.getModel("createTodoForm");
          oFormModel.setData({
            TITLE: oRawDataOnClicked.TITLE,
            DESCRIPTION: oRawDataOnClicked.DESCRIPTION,
            DUE_DATE: oRawDataOnClicked.DUE_DATE,
            STATUS: oRawDataOnClicked.STATUS,
          });

          // Edit Path setzen
          this._sEditPath = oContext.getPath();
          //console.log("EditPath nach Save: ", this._sEditPath);
          this.onOpenCreateDialog();
        },
        _showDeleteDialog: function () {
          const oView = this.getView();
          if (!this._oDeleteDialog) {
            this._oDeleteDialog = Fragment.load({
              id: oView.getId(),
              name: "com.example.meinetodolistenapp.view.fragments.table.DeleteTodoDialog",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }
          this._oDeleteDialog.then(function (oDialog) {
            oDialog.open();
            return oDialog;
          });
        },
        onOpenDeleteDialog: function (oEvent) {
          //delete-Dialog auf View zuweisen

          const oDeleteItem = oEvent.getSource().getBindingContext();
          const sDeletePath = oDeleteItem.getPath();
          this._sDeletePath = sDeletePath;
          this._showMultipleDeleteDialog();
        },
        _showMultipleDeleteDialog: function () {
          const oView = this.getView();
          const oResourceBundle = oView.getModel("i18n").getResourceBundle();
          if (!this._oDeleteMultipleDialog) {
            this._oDeleteMultipleDialog = Fragment.load({
              id: oView.getId(),
              name: "com.example.meinetodolistenapp.view.fragments.table.DeleteMultipleTodoDialog",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }
          this._oDeleteMultipleDialog.then(
            function (oDialog) {
              const iCount = this._aDeletePaths ? this._aDeletePaths.length : 0;
              const oText = Fragment.byId(oView.getId(), "multipleDeleteText");
              if (oText) {
                const message = oResourceBundle.getText("deleteMultipleTodos", [
                  iCount,
                ]);
                oText.setText(message);
              }

              oDialog.open();
            }.bind(this),
          );
          return this._oDeleteMultipleDialog;
        },
        onCancelDelete: function () {
          if (this._oDeleteDialog) {
            this._oDeleteDialog.then(function (oDialog) {
              oDialog.close();
            });
          }
          if (this._oDeleteMultipleDialog) {
            this._oDeleteMultipleDialog.then(function (oDialog) {
              oDialog.close();
            });
          }
          this._sDeletePath = null;
          this._aDeletePaths = null;
        },
        onConfirmDelete: function () {
          const oResourceBundle = this.getView()
            .getModel("i18n")
            .getResourceBundle();
          const sDeletePath = this._sDeletePath;
          console.log("Item deleted: ", sDeletePath);
          if (!sDeletePath) return;

          const oModel = this.getView().getModel();
          oModel.remove(sDeletePath, {
            success: () => {
              MessageToast.show(
                oResourceBundle.getText("deleteTodoConfirm.successText"),
              );
              this.onCancelDelete();
            },
            error: (error) => {
              console.log(error);
              MessageToast.show(
                oResourceBundle.getText("deleteTodoConfirm.errorText"),
              );
              this.onCancelDelete();
            },
          });
        },
        onOpenMultipleDeleteDialog: function (oEvent) {
          const oTable = this.byId("todoTable");
          const aSelectedItems = oTable.getSelectedContexts();

          const oResourceBundle = this.getView()
            .getModel("i18n")
            .getResourceBundle();

          if (aSelectedItems.length === 0) {
            MessageToast.show(
              oResourceBundle.getText(
                "deleteMultipleTodos.emptySelectedWarning",
              ),
            );
            return;
          }
          this._aDeletePaths = aSelectedItems.map((item) => item.getPath());
          this._sDeletePath = null;
          this._showMultipleDeleteDialog();
        },
        onConfirmMultipleDelete: function () {
          const oResourceBundle = this.getView()
            .getModel("i18n")
            .getResourceBundle();
          const oModel = this.getView().getModel();
          const aPaths = this._aDeletePaths;
          const iTodoCount = aPaths ? aPaths.length : 0;

          if (!aPaths || aPaths.length == 0) {
            MessageToast.show(
              oResourceBundle.getText(
                "deleteMultipleTodos.emptySelectedWarning",
              ),
            );
            return;
          }

          const sGroupId = "bulkDeleteGroup";
          const aDeferredGroups = oModel.getDeferredGroups();
          if (!aDeferredGroups.includes(sGroupId)) {
            oModel.setDeferredGroups(aDeferredGroups.concat([sGroupId]));
          }

          aPaths.forEach((aPath) => {
            oModel.remove(aPath, {
              groupId: sGroupId,
            });
          });

          oModel.submitChanges({
            groupId: sGroupId,
            success: function () {
              MessageToast.show(
                oResourceBundle.getText("deleteMultipleTodos.successText", [
                  iTodoCount,
                ]),
              );
              this._oDeleteMultipleDialog.then(function (oDialog) {
                oDialog.close();
              });
              this.byId("todoTable").removeSelections();
            }.bind(this),
            error: function (error) {
              console.log(error);
              MessageToast.show(
                oResourceBundle.getText("deleteTodoConfirm.errorText"),
              );
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
