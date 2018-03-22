const observableModule = require("data/observable");

/* ***********************************************************
 * Keep data that is displayed in your app drawer in the MyDrawer custom component view model.
 *************************************************************/
function MyDrawerViewModel(selectedPage, name, email) {
    const viewModel = observableModule.fromObject({
        /* ***********************************************************
         * Use the MyDrawer view model to initialize the properties data values.
         *************************************************************/
        selectedPage: selectedPage,
        name: name,
        email:email
    });

    return viewModel;
}

module.exports = MyDrawerViewModel;
