/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import {validateValue} from 'cy-bunsen/src/validator';
import ValidatorComponent from '../../components/validator';
import ModelValidator from './model';

const initialValue = {
    firstName: 'Steve',
    lastName: 'Rogers',
    addresses: [
        {
            street: '12345 Kent Avenue',
            city: 'Brooklyn',
            state: 'New York',
            zip: '11201',
        },
    ],
};

interface ValueState {
    errors?: Array<any>;
    model?: any;
    schema?: any;
    valueStr?: string;
    warnings?: Array<any>;
}

export default class Value extends React.Component<{}, ValueState> {
    public displayName: string = 'ValueValidator';

    constructor(props: any) {
        super(props);

        this.state = {
            errors: [],
            warnings: [],
            schema: {},
            valueStr: JSON.stringify(initialValue, null, 4),
        };
    }

    /**
     * Validate based on current state
     */
    private _validate(): void {
        try {
            const result = validateValue(JSON.parse(this.state.valueStr), this.state.model);
            this.setState({
                errors: result.errors,
                warnings: result.warnings,
            });
        } catch (e) {
            console.log(`Error caught: ${e}`);
            this.setState({
                warnings: [],
                errors: [
                    {
                        path: '#/',
                        message: 'Error Parsing JSON',
                    },
                ],
            });
        }
    }

    /* React method */
    public componentDidMount(): void {
        this._validate();
    }

    /* React method */
    public componentDidUpdate(prevProps: {}, prevState: ValueState): void {
        if ((prevState.valueStr !== this.state.valueStr) ||
            (prevState.model !== this.state.model)) {
            this._validate();
        }
    }

    /**
     * obvious
     * @param {String} value - the new String value for model
     */
    private onModelChange(value: string): void {
        try {
            this.setState({
                model: JSON.parse(value)
            });
        } catch (e) {
            console.error('Invalid model, not re-validating value:' + e);
        }
    }

    /**
     * obvious
     * @param {String} value - the new String value for value
     */
    private onValueChange(value: string): void {
        this.setState({
            valueStr: value
        });
    }

    /* React method */
    public render(): React.ReactElement<any> {
        return (
            <Grid className='validator-container' fluid={true}>
                <Row>
                    <Col className='model-col' md={6}>
                        <ModelValidator
                            onChange={this.onModelChange.bind(this)}
                            skipContainer={true}
                        />
                    </Col>
                    <Col className='val-col' md={6}>
                        <ValidatorComponent
                            errors={this.state.errors}
                            id='value-validator'
                            initialValue={this.state.valueStr}
                            label='Value'
                            onChange={this.onValueChange.bind(this)}
                            varName='valueEditor'
                            warnings={this.state.warnings}
                        />
                    </Col>
                </Row>
            </Grid>
        );
    }
}
