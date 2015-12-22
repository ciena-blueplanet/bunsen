/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as _  from 'lodash';

const createFactory = require('cy-utils').createFactory;

import {getSubModel} from '../utils';
import {addErrorResult, addWarningResult, aggregateResults} from './utils';

const viewSchema = require('./view-schema.json');

/**
 * Check if a cell includes a custom renderer
 * @param {Cell} cell - the cell to check
 * @returns {Boolean} true if the cell specifies a custom renderer
 */
function isCustomCell(cell: any): boolean {
    return (cell.renderer !== undefined) || (cell.itemRenderer !== undefined);
}

/**
 * Check if the given model is an array of objects
 * @param {Model} model - the model to check
 * @returns {Boolean} true if model is and array of objects
 */
function isObjectArray(model: any): boolean {
    return (model.type === 'array') && (model.items.type === 'object');
}

/**
 * @alias validator
 */
export default createFactory({

    /** attributes required by every container */
    REQUIRED_CONTAINER_ATTRS: ['id', 'rows'],

    /** optional top-level container attributes */
    OPTIONAL_CONTAINER_ATTRS: ['className', 'defaultClassName'],

    /**
     * Initialize the validator
     * @param {Container[]} containers - the Containers to validate container references against
     * @param {Model} model - the Model to validate model references against
     * @param {String[]} [renderers] - the list of available custom renderers to validate renderer references against
     * @returns {validator} the instance
     */
    init(containers: Array<any>, model: any, renderers: Array<any> = []): any {
        this.containers = containers;
        this.model = model;
        this.renderers = renderers;
        this.containersValidated = [];
        return this;
    },

    /**
     * Validate the sub-container, giving it it's appropriate sub-model
     * @param {String} path - the path the given row
     * @param {String} containerId - the id of the sub-container
     * @param {Model} model - the model to use to verify references against
     * @returns {ValidationResult} the results of the sub-container validation
     */
    _validateSubContainer(path: string, containerId: string, model: any): any {
        const results = [];
        const containerIndex = _.findIndex(this.containers, {id: containerId});
        const container = this.containers[containerIndex];
        if (container === undefined) {
            addErrorResult(results, path, `Invalid container reference "${containerId}"`);
        } else {
            results.push(
                this.validate(`#/containers/${containerIndex}`, container, model)
            );
        }

        return aggregateResults(results);
    },

    /**
     * Validate the given cell, with a custom renderer
     * @param {String} path - the path the given row
     * @param {Cell} cell - the cell to validate
     * @returns {ValidationResult} the results of the cell validation
     */
    _validateCustomCell(path: string, cell: any): any {
        const results = [
            {
                valid: true,
                errors: [],
            },
        ];

        let rendererName = cell.renderer;
        let rendererPathExt = 'renderer';
        if (rendererName === undefined) {
            rendererName = cell.itemRenderer;
            rendererPathExt = 'itemRenderer';
        }
        const rendererPath = `${path}/${rendererPathExt}`;

        if (!_.includes(this.renderers, rendererName)) {
            addErrorResult(results, rendererPath, `Invalid renderer reference "${rendererName}"`);
        }

        return aggregateResults(results);
    },


    /**
     * Validate the given cell, with a sub-model
     * @param {String} path - the path the given row
     * @param {Cell} cell - the cell to validate
     * @param {Model} [model] - the Model to validate model references against
     * @returns {ValidationResult} the results of the cell validation
     */
    _validateArrayCell(path: string, cell: any, model: any): any {
        const results = [];
        if (cell.container) {
            const msg = 'Containers on arrays not currently supported. Maybe you want it on the item sub-object?';
            addErrorResult(results, path, msg);
        } else if (cell.item.container) {
            results.push(
                this._validateSubContainer(`${path}/item/container`, cell.item.container, model.items)
            );
        }

        return aggregateResults(results);
    },

    /**
     * Validate the given cell, with a sub-model
     * @param {String} path - the path the given row
     * @param {Cell} cell - the cell to validate
     * @param {Model} subModel - the subModel
     * @returns {ValidationResult} the results of the cell validation
     */
    _validateModelCell(path: string, cell: any, subModel: any): any {
        const results = [];
        if (subModel === undefined) {
            addErrorResult(results, `${path}/model`, `Invalid model reference "${cell.model}"`);
        } else if (isCustomCell(cell)) {
            results.push(
                this._validateCustomCell(path, cell)
            );
        } else if (isObjectArray(subModel)) {
            results.push(
                this._validateArrayCell(path, cell, subModel)
            );
        } else if (subModel.type === 'object') {
            results.push(
                this._validateSubContainer(`${path}/container`, cell.container, subModel)
            );
        }

        return aggregateResults(results);
    },

    /**
     * Validate the given cell, with a sub-model dependent on another sub model
     * @param {String} path - the path the given row
     * @param {Cell} cell - the cell to validate
     * @param {Model} [model] - the Model to validate model references against
     * @returns {ValidationResult} the results of the cell validation
     */
    _validateDependentModelCell(path: string, cell: any, model: any): any {
        const results = [];
        const dependencyModel: any = getSubModel(model, cell.dependsOn);

        if (dependencyModel === undefined) {
            addErrorResult(results, `${path}/dependsOn`, `Invalid model reference "${cell.dependsOn}"`);
            return aggregateResults(results);
        }

        const subModel: any = getSubModel(model, cell.model, cell.dependsOn);
        results.push(
            this._validateModelCell(path, cell, subModel)
        );

        return aggregateResults(results);
    },

    /**
     * Validate the given cell
     * @param {String} path - the path the given row
     * @param {Cell} cell - the cell to validate
     * @param {Model} [model] - the Model to validate model references against
     * @returns {ValidationResult} the results of the cell validation
     */
    _validateCell(path: string, cell: any, model: any): any {
        const results = [];

        if (cell.dependsOn) {
            results.push(
                this._validateDependentModelCell(path, cell, model)
            );
        } else if (cell.model) {
            const subModel: any = getSubModel(model, cell.model);
            results.push(
                this._validateModelCell(path, cell, subModel)
            );
        } else if (cell.container) {
            results.push(
                this._validateSubContainer(`${path}/container`, cell.container, model)
            );
        } else {
            addErrorResult(results, path, 'Either "model" or "container" must be defined for each cell.');
        }

        const knownAttributes = _.keys(viewSchema.definitions.cell.properties);
        _.forEach(_.keys(cell), (attr: string) => {
            if (!_.includes(knownAttributes, attr)) {
                addWarningResult(results, path, `Unrecognized attribute "${attr}"`);
            }
        });

        return aggregateResults(results);
    },

    /**
     * Validate the given row
     * @param {String} path - the path the given row
     * @param {Cell[]} cells - the cells within the row
     * @param {Model} [model] - the Model to validate model references against
     * @returns {ValidationResult} the results of the row validation
     */
    _validateRow(path: string, cells: Array<any>, model: any): any {
        if (!_.isArray(cells)) {
            return {
                valid: false,
                errors: [
                    {
                        path,
                        message: 'Rows must consist of Arrays of Cells',
                    },
                ],
                warnings: [],
            };
        }


        const results = _.map(cells, (cell: any, index: number) => {
            return this._validateCell(`${path}/${index}`, cell, model);
        });

        return aggregateResults(results);
    },

    /**
     * Validate the given config
     * @param {String} path - the path to the container from the root of the config
     * @param {Container} container - the container to validate
     * @param {Model} [model] - the Model to validate model references against
     * @returns {ValidationResult} the results of the container validation
     */
    validate(path: string, container: any, model: any): any {
        // keep track of which paths we've validated
        this.containersValidated.push(path);

        if (model === undefined) {
            model = this.model;
        }

        const results = [];

        const attrs = _.keys(container);

        const warnings = [];
        const knownAttributes = _.union(this.REQUIRED_CONTAINER_ATTRS, this.OPTIONAL_CONTAINER_ATTRS);
        _.forEach(attrs, (attr: string) => {
            if (!_.includes(knownAttributes, attr)) {
                warnings.push({
                    path,
                    message: `Unrecognized attribute "${attr}"`,
                });
            }
        });

        if (warnings.length > 0) {
            results.push({
                valid: true,
                warnings,
                errors: [],
            });
        }

        _.forEach(container.rows, (row: any, index: number) => {
            results.push(
                this._validateRow(`${path}/rows/${index}`, row, model)
            );
        });

        return aggregateResults(results);
    },
});
