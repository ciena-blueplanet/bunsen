/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react';
import {validateModel} from 'cy-bunsen/src/validator';
import ValidatorComponent from '../../components/validator';

const initialModel = {
    type: 'object',
    properties: {
        firstName: {
            title: 'First Name',
            type: 'string',
        },
        lastName: {
            title: 'Last Name',
            type: 'string',
        },
        addresses: {
            title: 'Addresses',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    street: {type: 'string'},
                    city: {type: 'string'},
                    state: {type: 'string'},
                    zip: {type: 'string'},
                },
                required: ['street', 'city', 'state', 'zip'],
            },
        },
    },
    required: ['firstName', 'lastName', 'addresses'],
};

interface ModelProps {
    onChange?: any;
    skipContainer?: boolean;
}

interface ModelState {
    errors?: Array<any>;
    warnings?: Array<any>;
}

export default class Model extends React.Component<ModelProps, ModelState> {
    public displayName: string = 'ModelValidtaor';

    constructor(props: ModelProps) {
        super(props);

        this.state = {
            errors: [],
            warnings: [],
        };
    }

    /**
     * Validate the given value
     * @param {String} value - the value to validate
     */
    private _validate(value: string): void {
        if (this.props.onChange) {
            this.props.onChange(value);
        }

        const result = validateModel(value);
        this.setState({
            errors: result.errors,
            warnings: result.warnings,
        });
    }

    /* React method */
    public componentWillMount(): void {
        this._validate(JSON.stringify(initialModel, null, 4));
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const className = this.props.skipContainer ? '' : 'container';

        return (
            <div className={className}>
                <ValidatorComponent
                    errors={this.state.errors}
                    id='model-validator'
                    initialValue={JSON.stringify(initialModel, null, 4)}
                    label='Model'
                    onChange={this._validate.bind(this)}
                    varName='modelEditor'
                    warnings={this.state.warnings}
                />
            </div>
        );
    }
}
