/// <reference path="~/GeneratedArtifacts/viewModel.js" />
/// <reference path="~/scripts/jabls-1.0.0.js" />

myapp.Account.created = function (entity) {
    // Write code here.

};

myapp.Account.Phone_validate = function (entity, validationResults) {
    return validationResults = [];
};

myapp.Account.SSN_validate = function (entity, validationResults) {
    // Write code here.
    var message = "";
    var regex = /^\d{3}-\d{2}-\d{4}$/;
    if (entity.SSN) {
        if (!regex.test(entity.SSN)) {
            message = "Invalid Pattern"
        }
    }
    else {
        message = "SSN Required"
    }
    if (message.length > 0) {
        validationResults.push(new msls.ValidationResult(entity.SSN, message));
    }
    else {
        validationResults = [];
    }
    return validationResults;
};

myapp.Account.Email_validate = function (entity, validationResults) {
    // Write code here.
    var message = "";
    var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (entity.Email) {
        if (!regex.test(entity.Email)) {
            message = "Invalid Pattern"
        }
    }
    else {
        message = "Email Required"
    }
    if (message.length > 0) {
        validationResults.push(new msls.ValidationResult(entity.Email, message));
    }
    else {
        validationResults = [];
    }
    return validationResults;
};