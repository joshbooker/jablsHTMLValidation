/// <reference path="~/GeneratedArtifacts/viewModel.js" />

myapp.ViewAccount.Details_postRender = function (element, contentItem) {
    // Write code here.
    var name = contentItem.screen.Account.details.getModel()[':@SummaryProperty'].property.name;
    contentItem.dataBind("screen.Account." + name, function (value) {
        contentItem.screen.details.displayName = value;
    });
}

