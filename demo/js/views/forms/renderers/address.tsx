/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react';
import {Grid, Row, Col, Input} from 'react-bootstrap';
import {getLabel} from 'cy-bunsen/src/utils';

/**
 * Parse a string address into it's parts
 * @param {String} addressStr - the string address
 * @returns {Object} an address object
 */
function parseAddress(addressStr: string): any {
    const [street, bottom] = addressStr.split('\n');
    const [city, rest] = (bottom !== undefined) ? bottom.split(',') : [undefined, undefined];
    const [state, zip] = (rest !== undefined) ? rest.trim().split(' ') : [undefined, undefined];

    return {
        street,
        city,
        state,
        zip,
    };
}

interface AddressRendererProps {
    id: string;
    label?: string;
    model: any;
    onChange: any;
    required?: boolean;
}

interface AddressRendererState {
    value?: any;
}

export default class AddressRenderer extends React.Component<AddressRendererProps, AddressRendererState> {
    public displayName: string = 'AddressRenderer';

    constructor(props: AddressRendererProps) {
        super(props);

        this.state = {
            value: {}
        };
    }

    /**
     * Handle change event and notify parent
     * @param {SyntheticEvent} e - the change event from the DOM
     */
    private _onChange(e: any): void {
        this.setState({
            value: parseAddress(e.target.value)
        });
    }

    /* React method */
    public componentDidUpdate(prevProps: AddressRendererProps, prevState: AddressRendererState): void {
        if (prevState.value !== this.state.value) {
            this.props.onChange({
                id: this.props.id,
                value: this.state.value,
            });
        }
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const format = '1383 North McDowell Blvd., Suite 300\nPetaluma, CA 94954';
        const label = getLabel(this.props.label, this.props.model, this.props.id);


        const labelComponent = (
            <Row>
                <Col md={12}>
                    <h2>{label}</h2>
                </Col>
            </Row>
        );

        const labelWrapper = (this.props.label === null) ? null : labelComponent;

        return (
            <Grid className='address-renderer' fluid={true}>
                {labelWrapper}
                <Row>
                    <Col md={12}>
                        <Input
                            onChange={this._onChange.bind(this)}
                            placeholder={format}
                            type='textarea'
                        />
                    </Col>
                </Row>
            </Grid>
        );
    }
}
