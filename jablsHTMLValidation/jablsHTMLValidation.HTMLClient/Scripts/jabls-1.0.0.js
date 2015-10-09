/*!
    JAB LightSwitch JavaScript Library v1.0.0
*/

var jabls = (function () {
    var _jabls = {};

    _jabls.enableFilterSort = function (screen) {
        // Write code here.
        //TO DO: test another way to get collections with less code 
        var model, collectionProperties, collectionName, property;
        model = screen.details.getModel();
        collectionProperties = msls.iterate(model.properties)
                        .where(function (p) {
                            return p.propertyType.kind == "CollectionView";
                        })
                        .array;
        collectionProperties.forEach(function (collectionValue, index) {
            collectionName = collectionProperties[index].name;
            property = screen.details.properties[collectionName];
            query = property._entry.simpleDescriptor.createQuery;
            //only overide once - have we done this already?
            if (!query.old) {
                //save the old query
                property._entry.simpleDescriptor.createQuery.old = query;
                //override the query
                property._entry.simpleDescriptor.createQuery =
                    //TO DO: can we make these argument generic
                    function (filterString, sortString) {
                        //if these params don't exist in the query or both have no value
                        if (!filterString && !sortString) {
                            //do the default behavior
                            return query.old.apply(this, arguments);
                        } else {
                            // append filter and orderBy methods
                            return query.old.apply(this, arguments)
                                .filter(filterString)
                                .orderBy(sortString);
                        }
                    };
            }
        });
    };
    //TO DO: drop the NotSearchable - odata filter must handle quotes respective datatype
    _jabls.collectionPropsToArray = function (collection) {
        var propNames = [];
        var props = msls.iterate(collection.properties)
                .where(function (p) {
                    return !p[":@NotSearchable"];
                })
                .array;
        props.forEach(function (collectionValue, index) {
            propNames.push(props[index].name);
        });
        return propNames;
    };

    _jabls.queryBuilder = function (element, contentItem) {
        var collection = contentItem.valueModel.elementType;

        //TO DO: is there a cleaner way to pass to iframe?
        //maybe eliminate iframe (?)
        window.QueryBuilder = {props : _jabls.collectionPropsToArray(collection)};
       
        var iframe = $("<iframe src='Scripts/ko-qb/index.html'></iframe>")
        iframe.css({"border":"none"});
        $(element).append(iframe);
        $(window).one("popupcreate", function (e) {
            $(e.target).popup({
                positionTo: "window"
            });
            //var w = $(window).width() - 100;
            var w = 600;
            var popupContent = $(e.target).find("div.msls-popup-content");
            //var iframe = popupContent.find("iframe");
            popupContent.attr("style", "min-width: " & w & "px; max-width: " & w & "px;");
            iframe.attr("width", w);
            iframe.attr("height", $(window).height() - 200);
        });

        $(window).one("popupbeforeposition", function (e) {
            e.target._mslsCustomPosition = undefined;
        });
    };

    _jabls.addComputedProperties = function (entity) {
        //get entity name  ie: "LightSwitch.Customer" = "Customer"
        var entityType = entity.__metadata.type.split(".").pop();
        //get the entity class - this object contains all methods defined in Customer.lsml.js
        var entityClass = myapp[entityType]
        //build an array of property names from '_Compute' methods
        var properties = [];
        for (var p in entityClass) {
            if (typeof entityClass[p] === "function" && p.indexOf("_Compute") > 0) {
                prop = { name: p.split("_")[0], type: String };
                properties.push(prop);
            }
        };
        //console.log(properties);
        //add the computed prop to this entity by calling the _Compute method
        if (properties) {
            properties.forEach(function (entry) {
                var entryName = entry.name;
                var computeMethod = entityClass[entryName + "_Compute"];
                entity[entryName] = computeMethod.call(this, entity);
            });
        }
    };

    _jabls.addScreenValidation = function (screen) {
        var model, collectionProperties, entityName, propName, property;
        model = screen.details.getModel();
        //get addEdit screen entityProperty
        entityProperty = msls.iterate(model.properties)
                        .where(function (p) {
                            return p.propertyType.__isEntityType;
                        })
                        .array[0];
        //get entity name  
        var entityType = entityProperty.name;//"Account"
        //get entity
        var screenEntity = screen[entityType];
        //get the entity class - this object contains all methods defined in Account.lsml.js
        var entityClass = myapp[entityType]

        //build an array of property names from '_validate' methods
        var properties = [];
        for (var p in entityClass) {
            if (typeof entityClass[p] === "function" && p.indexOf("_validate") > 0) {
                prop = { name: p.split("_")[0], type: String };
                properties.push(prop);
            }
        };
        //console.log(properties);

        properties.forEach(function (prop, index) {
            propName = prop.name;
            //get validate method
            var validateMethod = entityClass[propName + "_validate"];
            //find contentItem
            var contentItem = screen.findContentItem(propName);
            
            if (contentItem) {// contentItem found
                //listen for a change on value
                contentItem._alwaysShowValidationResults = true;
                contentItem.dataBind("value", function (newValue) {
                    if (newValue) {
                        setTimeout(function () {
                            //call validateMethod passing and returning validationResults array
                            contentItem.validationResults = validateMethod.call(this, screen[entityType], contentItem.validationResults);
                        }, 10);
                    }
                });
            }
        });
    };

    _jabls.isPrintPreview = function () {
        var currCSS = document.getElementById("printCSS");
        return (currCSS.media !== "print");
    };

    _jabls.togglePrintPreview = function () {
        var currCSS = document.getElementById("printCSS");
        if (currCSS.media == "all")
            currCSS.media = "print";
        else currCSS.media = "all";
    };

    _jabls.deleteEntity = function (entity, options) {
        /// <summary>
        /// Delete an entity
        /// </summary>
        /// <param name="entity" type="Object">the entity to be deleted</param>
        /// <param name="options" optional="true" type="PlainObject">
        /// A set of key/value pairs used to select additional configuration options. All options are optional.
        /// <br/>- String displayName: defines the description to be used to refer to this type of entity in the deletion prompt (default: "Entry")
        /// <br/>- Number navigateBackDistance: determines the number of screens to navigate back after deletion (default: 0)
        /// <br/>- Boolean remainOnScreen: when set to true, this method remains on the same screen after deletion of an entity (default: false)
        /// </param>
        /// credit: ChrisCookDev https://github.com/ChrisCookDev

        options = options || {}; // Force options to be an object
        var displayName = options.displayName || "Entry";
        msls.showMessageBox("Are you sure you want to permanently delete this " + displayName.toLowerCase() + "?", {
            title: "Delete " + displayName,
            buttons: msls.MessageBoxButtons.yesNo
        }).then(function (result) {
            if (result === msls.MessageBoxResult.yes) {
                entity.deleteEntity();
                var fn = myapp.commitChanges;
                if (options.remainOnScreen || (typeof options.navigateBackDistance !== "undefined" && options.navigateBackDistance === 0)) {
                    fn = myapp.applyChanges;
                }
                return fn().then(function onComplete(result) {
                    if (options.navigateBackDistance && options.navigateBackDistance > 1) {
                        for (var i = 1; i < options.navigateBackDistance; i++) {
                            myapp.navigateBack();
                        }
                    }
                }, function onError(e) {
                    msls.showMessageBox(e.message, {
                        title: e.title
                    }).then(function () {
                        entity.details.discardChanges(); // NOTE: unlike myapp.cancelChanges, discardChanges remains on the screen (for further details see http://lightswitchhelpwebsite.com/Blog/tabid/61/EntryId/188/Deleting-Data-In-The-Visual-Studio-LightSwitch-HTML-Client.aspx)
                    });
                });
            }
        });
    };//deleteEntity

    return _jabls;
})();

/*
This script patches the OData read method 
enabling us to inject operations before the results return to the LS runtime
*/
var origJsonReadFunc = OData.jsonHandler.read;
OData.jsonHandler.read = function (response, context) {
    var result = origJsonReadFunc.call(OData.jsonHandler, response, context);
    var data = response.data, results = data.results;
    if (results) {
        results.forEach(function (entity) {
            //do stuff to each entity here

            //call function to add Computed properties
            jabls.addComputedProperties.call(this, entity);

        });
    }

    return result;
};