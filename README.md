# bunsen

A system for creating UIs based on a JSON configuration. Currently, we only support forms, but we have plans to expand
support for different types of UIs as well.

## Top-level Components
`bunsen` exports a React component that can be initialized to render a form:

### Form

```js
const React = require('react');
const Form = require('cy-bunsen');

React.render(
    <Form
        initialValue={}
        model={}
        onChange={}
        onSubmit={}
        onValidation={}
        renderers={}
        validators=[]
        view={}
    />,
    document.body
);

```

The properties for the component are described here:

| Property       | Type       | Required | Description                                     |
| -------------- | ---------- |:--------:| ----------------------------------------------- |
| `initialValue` | `object`   |    No    | Initial instance of [model](#model)             |
| `model`        | `object`   |    Yes   | See [model](#model) section below               |
| `onCancel`     | `function` |    No    | See [onCancel](#oncancel) section below         |
| `onChange`     | `function` |    No    | See [onChange](#onchange) section below         |
| `onSubmit`     | `function` |    No    | See [onSubmit](#onsubmit) section below         |
| `onValidation` | `function` |    No    | See [onValidation](#onvalidation) section below |
| `renderers`    | `object`   |    No    | See [renderers](#renderers) section below       |
| `validators`   | `array`    |    No    | See [validators](#validators) section below     |
| `view`         | `object`   |    Yes   | See [view](#view) section below                 |


### Detail

```js
const React = require('react');
const Form = require('cy-bunsen');

React.render(
    <Detail
        model={}
        renderers={}
        value={}
        view={}
    />,
    document.body
);

```

The properties for the component are described here:

| Property       | Type       | Required | Description                                     |
| -------------- | ---------- |:--------:| ----------------------------------------------- |
| `model`        | `object`   |    Yes   | See [model](#model) section below               |
| `renderers`    | `object`   |    No    | See [renderers](#renderers) section below       |
| `value`        | `object`   |    No    | Instance of [model](#model) to display          |
| `view`         | `object`   |    Yes   | See [view](#view) section below                 |


### model
A valid [JSON Schema](http://spacetelescope.github.io/understanding-json-schema/)
with a few additional limitations/custom fields.
This schema is to describe the object that will be ultimately constructed from the user's input.

#### Model Limitations

<!--
    This is a little ugly because I don't know how to better do multi-line text in a table -ARM
-->

| Keyword | Limitations |
| ------- |-------------|
| `$ref`  | references **are** supported but [combinations](http://spacetelescope.github.io/understanding-json-schema/reference/combining.html#combining) are **not** |
| `type`  | only `object`, `array` and `string` are currently supported. The root of the schema also **MUST** be an `object` |
| `items` | when `type` is `array`, the `items` keyword *must* be an `object`, the "tuple" notation of specifying an array of items is not currently supported, i.e. the array must be all the same type, and currently that type cannot be a primitive. |
| `title` | used to customize labels for inputs without needing to provide a view |

### renderers
The `renderers` is a key-value pair of string renderer names and `React` components that implement custom renderers.
A custom renderer must accept the following properties:

| Property   | Type       | Description                                                  |
| ---------- | ---------- | ------------------------------------------------------------ |
| `id`       | `String`   | the identifier used when constructing a `ChangeEvent`'       |
| `model`    | `Object`   | the model schema to display                                  |
| `onChange` | `Function` | a callback used to notify parent when user changes the value |
| `required` | `Boolean`  | flag for whether or not this piece of the model is required  |


### onCancel
When present, `onCancel` will be called whenever the user clicks the cancel button.
The cancel button is only rendered when `onCancel` is given.

### onChange
When present, `onChange` will be called whenever the user modifies data in the generated form.
The value passed to the method will be an `object` which represents the data the user has entered so far, and
should eventually satisfy the `model` schema (once the form passes validation).


### onSubmit
When the optional `onSubmit` handler is provided, a submit button will be created. It will be disabled while the form
is invalid, and become enabled as soon as all fields pass validation. When the user clicks the submit button, the
handler will be called with the `object` representing the data that the user entered (the same as `onChange`).

### onValidation
When the optional `onValidation` handler is provided

### validators
`validators` is an array of `functions` which accept an `object` representing the current value for the
`Form` and the `model` for that value and return a promise that will be resolved with a `ValidationResult`

#### `ValidationResult`
The result of validation, which contains three properties `valid`, `errors`, and `warnings`. `valid` is a `boolean`
that should be false if any `errors` exist. (NOTE: we can/should probably remove this since it should always exactly
equal `errors.length === 0`). `errors` and `warnings` are both arrays of `object`s which each have two properties:
`path` (the path to where the issue exists, i.e. `#/foo/bar`) and `message` (the actual error/warning message).

### view
The `view` is a JSON configuration for the layout of the UI. It allows some customization of presentation of the UI.

The `view` JSON is described by the following JSON Schema (also available [here](src/validator/view-schema.json)):

<!-- BEGIN view-schema.json -->

```json
{
    "additionalProperties": false,
    "definitions": {
        "cell": {
            "additionalProperties": false,
            "type": "object",
            "description": "A single cell in the grid system, 'model' or 'container' is required",
            "properties": {
                "model": {
                    "type": "string",
                    "description": "Dotted notation reference to a property in the Model"
                },
                "dependsOn": {
                    "type": "string",
                    "description": "Dotted notation reference to a property in the model that this property depends on"
                },
                "container": {
                    "type": "string",
                    "description": "The 'id' of a container in the 'containers' array"
                },
                "renderer": {
                    "type": "string",
                    "description": "Name of a custom renderer for the model"
                },
                "className": {
                    "type": "string",
                    "description": "CSS 'className' for this cell"
                },
                "label": {
                    "type": "string",
                    "description": "The user-visible label for this cell"
                },
                "labelClassName": {
                    "type": "string",
                    "description": "CSS 'className' for the label of the input",
                    "default": "col-md-3"
                },
                "inputClassName": {
                    "type": "string",
                    "description": "CSS 'className' for the input itself",
                    "default": "col-md-9"
                },
                "placeholder": {
                    "type": "string",
                    "description": "Text to display when no value is set"
                },
                "properties": {
                    "type": "object",
                    "description": "Properties to pass to custom renderers"
                },
                "item": {
                    "additionalProperties": false,
                    "type": "object",
                    "description": "The configuration for a particular item when the parent is an array",
                    "properties": {
                        "inline": {
                            "type": "boolean",
                            "description": "When true, use inline item rendering instead of tabs"
                        },
                        "container": {
                            "type": "string",
                            "description": "The 'id' of a container in the 'containers' array"
                        },
                        "renderer": {
                            "type": "string",
                            "description": "Name of a custom renderer for the model"
                        },
                        "className": {
                            "type": "string",
                            "description": "CSS 'className' for this cell"
                        },
                        "label": {
                            "type": "string",
                            "description": "The user-visible label for this cell"
                        },
                        "labelClassName": {
                            "type": "string",
                            "description": "CSS 'className' for the label of the input",
                            "default": "col-md-3"
                        },
                        "inputClassName": {
                            "type": "string",
                            "description": "CSS 'className' for the input itself",
                            "default": "col-md-9"
                        },
                        "placeholder": {
                            "type": "string",
                            "description": "Text to display when no value is set"
                        },
                        "properties": {
                            "type": "object",
                            "description": "Properties to pass to custom renderers"
                        }
                    }
                }
            }
        }
    },

    "type": "object",
    "description": "The JSON Schema for a view definition",
    "properties": {
        "version": {
            "type": "string",
            "description": "For future use",
            "enum": ["1.0"]
        },
        "type": {
            "type": "string",
            "description": "What kind of view is this? A form that requests information, or detail that displays it?",
            "enum": ["form", "detail"]
        },
        "rootContainers": {
            "type": "array",
            "description": "Top-level entry-point containers (i.e. tabs) currently only one is allowed",
            "items": {
                "type": "object",
                "properties": {
                    "container": {
                        "type": "string",
                        "description": "The 'id' of a container in the 'containers' array"
                    },
                    "label": {
                        "type": "string",
                        "description": "User-visible label for the entry-point (i.e. tab)"
                    }
                },
                "required": ["container", "label"]
            },
            "minItems": 1,
            "maxItems": 1
        },
        "containers": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "A unique identifier for this container (used as a reference to it)"
                    },
                    "className": {
                        "type": "string",
                        "description": "A CSS className for the container div itself"
                    },
                    "defaultClassName": {
                        "type": "string",
                        "description": "A default 'className' to use on all cells that do not specify one"
                    },
                    "rows": {
                        "type": "array",
                        "items": {
                            "type": "array",
                            "description": "A representation of a row in a grid layout, defined as an array of cells",
                            "items": {
                                "$ref": "#/definitions/cell"
                            }
                        },
                        "minItems": 1
                    }
                },
                "required": ["id", "rows"]
            },
            "minItems": 1
        },
        "buttonLabels": {
            "type": "object",
            "properties": {
                "submit": {
                    "type": "string",
                    "description": "The user-visible label for the submit button",
                    "default": "Submit"
                },
                "cancel": {
                    "type": "string",
                    "description": "The user-visible label for the cancel button",
                    "default": "Cancel"
                }
            }
        }
    },
    "required": ["version", "type", "rootContainers",  "containers"]
}
```

<!-- END view-schema.json -->
