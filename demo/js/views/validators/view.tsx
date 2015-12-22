/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import validate from 'cy-bunsen/src/validator';
import ValidatorComponent from '../../components/validator';
import ModelValidator from './model';

const initialView = {
    version: '1.0',
    type: 'form',
    containers: [
        {
            id: 'main',
            className: 'col-md-12',
            defaultClassName: 'col-md-12',
            rows: [
                [{model: 'firstName'}],
                [{model: 'lastName'}],
                [
                    {
                        model: 'addresses',
                        item: {
                            container: 'address'
                        },
                    },
                ],
            ],
        },
        {
            id: 'address',
            rows: [
                [{model: 'street'}],
                [{model: 'city'}, {model: 'state'}, {model: 'zip'}],
            ],
        },
    ],
    rootContainers: [{label: 'Main', container: 'main'}],
};

interface ViewState {
    errors?: Array<any>;
    model?: any;
    schema?: any;
    viewStr?: string;
    warnings?: Array<any>;
}

export default class View extends React.Component<{}, ViewState> {
    public displayName: string = 'ViewValidator';

    constructor(props: any) {
        super(props);

        this.state = {
            errors: [],
            warnings: [],
            schema: {},
            viewStr: JSON.stringify(initialView, null, 4),
        };
    }

    /**
     * Validate based on current state
     */
    private _validate(): void {
        const result = validate(this.state.viewStr, this.state.model);
        this.setState({
            errors: result.errors,
            warnings: result.warnings,
        });
    }

    /* React method */
    public componentDidMount(): void {
        this._validate();
    }

    /* React method */
    public componentDidUpdate(prevProps: {}, prevState: ViewState): void {
        if ((prevState.viewStr !== this.state.viewStr) ||
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
            console.error('Invalid model, not re-validating view:' + e);
        }
    }

    /**
     * obvious
     * @param {String} value - the new String value for view
     */
    private onViewChange(value: string): void {
        try {
            this.setState({
                viewStr: value
            });
        } catch (e) {
            console.error('Invalid model, not re-validating view:' + e);
        }
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
                    <Col className='view-col' md={6}>
                        <ValidatorComponent
                            errors={this.state.errors}
                            id='view-validator'
                            initialValue={this.state.viewStr}
                            label='View'
                            onChange={this.onViewChange.bind(this)}
                            varName='viewEditor'
                            warnings={this.state.warnings}
                        />
                    </Col>
                </Row>
            </Grid>
        );
    }
}
