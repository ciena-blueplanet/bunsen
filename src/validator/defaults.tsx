/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');

const viewSchema = require('./view-schema.json');

/**
 * Get the default button labels from the schema
 * @returns {Object} key-value pairs of the button and it's default label
 */
export function getButtonLabelDefaults(): any {
    const labels = {};
    _.forIn(viewSchema.properties.buttonLabels.properties, (value: any, key: string) => {
        labels[key] = value['default'];
    });
    return labels;
}

/**
 * Get the default values for properties on a Cell
 * @returns {Object} - the defaults for a Cell
 */
export function getCellDefaults(): any {
    const cellSchema = viewSchema.definitions.cell;

    const cellDefaults = {};

    _.forIn(cellSchema.properties, (value: any, key: string) => {
        const defaultValue = value['default'];
        if (defaultValue !== undefined) {
            cellDefaults[key] = defaultValue;
        }
    });

    return cellDefaults;
}
