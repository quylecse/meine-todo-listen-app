sap.ui.define(
  ["sap/ui/core/UIComponent", "./model/models", "./model/statusModel"],
  (UIComponent, models, statusModel) => {
    "use strict";

    return UIComponent.extend("com.example.meinetodolistenapp.Component", {
      metadata: {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
      },

      init() {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        const oStatusModel = statusModel.createStatusModel();
        this.setModel(oStatusModel, "status");

        // enable routing
        this.getRouter().initialize();
      },
    });
  },
);
