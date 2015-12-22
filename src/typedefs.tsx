/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/**
 * @typedef {Object|String} ValidatorOptions
 * The options to pass to the validator, format depends on the validator
 */

/**
 * @typedef ValidatorSet
 * A key-value pair of validator name => ValidatorOptions
 */

/**
 * @typedef Model
 * JSON Schema defining the model (JSON schema)
 *
 * http://spacetelescope.github.io/understanding-json-schema/reference/generic.html
 * http://spacetelescope.github.io/understanding-json-schema/reference/type.html
 *
 * @property {String} type - the type of model ['string', 'object', 'array']
 * @property {String} title - user-presented label for the model
 * @property {String} [description] - kinda like a comment, meant for the human reader of the schema/model
 * @property {ModelSet} [properties] - sub-model info for 'object' type models
 * @property {*[]} [enum] - array of possible values that are valid
 * @property {*} [default] - the default value for this field
 *
 * The following properties are only supported when the type is 'string'
 * @property {Number} [minLength] - the minimum length of the string
 * @property {Number} [maxLength] - the maximum length of the string
 * @property {String} [pattern] - a regular expression that the string value must match
 */

/**
 * @typedef ModelSet
 * A key-value pair of ID => Model
 */

/**
 * @typedef Cell
 *
 * NOTE: One of container or model is required
 *
 * @property {String} [container] - reference to the ID of a container defined in the containers array
 * @property {String} [model] - reference to the ID of a model defined in the ModelSet (use dot notation for children)
 * @property {String} [className] - a CSS class (or space-separated classes) to apply to the cell
 */

/**
 * @typedef {Cell[]} Row
 * An array of cells makes up a row
 */

/**
 * @typedef Container
 * @property {String} id - the unique ID for the container, used to generate a ContainerSet
 * @property {Row[]} rows - the rows in the container
 * @property {String} [className] - a CSS class (or space-separated classes) to apply to the container
 * @property {String} [defaultClassName] - a CSS class (or space-separated classes) to apply to all Cells
 */

/**
 * @typedef ContainerSet
 * A key-value pair of ID => Container
 */

/**
 * @typedef RootContainer
 * @property {String} label - the user visible label for this root view (displayed as tab name if more than one)
 * @property {String} container - reference to the ID of a container defined in the containers array
 */

/**
 * @typedef View
 * @property {String} version - the version of this schema
 * @property {String} type - the type of this schema (currently only "form" is supported)
 * @property {Container[]} containers - the containers for the config (layout)
 * @property {RootContainer[]} rootContainers - the top-level views (create tabs if more than one, not yet supported)
 */

/**
 * @typedef ValidationError
 * @property {String} path - the dotted path to the attribute where the error occurred
 * @property {String} message - the error message
 */

/**
 * @typedef ValidationWarning
 * @property {String} path - the dotted path to the attribute where the error occurred
 * @property {String} message - the warning message
 */

/**
 * @typedef ValidationResult
 * @property {Boolean} valid - true if schema was valid, false if not
 * @property {ValidationWarning[]} warnings - the warnings (if any)
 * @property {ValidationError[]} errors - the errors (if any)
 */

/**
 * @typedef ChangeEvent
 * @property {String} id - the ID for the element that changed
 * @property {*} value - the value that changed
 */

/**
 * @typedef ArrayItem
 * @property {String} key - the react key for the item
 * @property {Object} data - the actual data for the item
 */

/**
 * @callback onChange
 * @param {Object} data - the data that has been entered by the user, it should follow the Model schema, although
 *                        it may be missing properties if they have not been entered by the user yet and do not have
 *                        defaults defined.
 */

/**
 * @callback onSubmit
 * @param {Object} data - the data that has been entered by the user, it should follow the Model schema
 */

/**
 * @callback onValidation
 * @param {ValidationResult} result - the result of the most recent validation of the form content
 *                                    (not the model or view)
 */

/**
 * @typedef RendererSet
 * A key-value pair of string renderer names and their React classes
 */

/**
 * @typedef DereferenceResult
 * The result of dereferencing a schema
 * @property {Object} schema - the dereferenced schema
 * @property {ValidationError[]} errors - the list of errors encountered during dereferencing
 * @property {String[]} refs - the list of references which were encountered/processed
 */

/**
 * @typedef Store
 * A collection of all the stuff the top-level component wants to pass to all children
 * This will eventually move into a Flux store
 * @property {Object} formValue - the current value of the entire form
 * @property {RendererSet} renderers - the set of all custom renderers
 * @property {ValidationResult} validationResult - the result of the overall validation
 * @property {View} view - the top-level view for the whole form
 */
