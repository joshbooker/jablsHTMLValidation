/// <reference path="~/GeneratedArtifacts/viewModel.js" />

myapp.BrowseAccounts.Search_postRender = function (element, contentItem) {
    // Write code here.
    contentItem.dataBind("value",function(v){
        if (v && v.length < 3) {
            contentItem._alwaysShowValidationResults = true;
            contentItem.validationResults = [
                new msls.ValidationResult(contentItem.screen.details.properties.Search, "too short")
            ];
        } else if (contentItem.hasValidationErrors) {
            contentItem.validationResults = [];
        };
    });
};