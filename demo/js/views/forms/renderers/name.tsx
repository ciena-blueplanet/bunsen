/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react';
import {Grid, Row, Col, Input} from 'react-bootstrap';
import {getLabel} from 'cy-bunsen/src/utils';

interface NameRendererProps {
    id: string;
    label?: string;
    model: any;
    onChange: any;
    required?: boolean;
}

interface NameRendererState {
    value?: any;
}

export default class NameRenderer extends React.Component<NameRendererProps, NameRendererState> {
    public displayName: string = 'NameRenderer';

    constructor(props: NameRendererProps) {
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
        const fullName = e.target.value;
        const parts = fullName.split(' ');
        const first = parts[0];
        const last = (parts.length > 1) ? parts.slice(1).join(' ') : undefined;
        this.setState({
            value: {
                first,
                last,
            },
        });
    }

    /* React method */
    public componentDidUpdate(prevProps: NameRendererProps, prevState: NameRendererState): void {
        if (prevState.value !== this.state.value) {
            this.props.onChange({
                id: this.props.id,
                value: this.state.value,
            });
        }
    }

    /* React method */
    public render(): React.ReactElement<any> {
        const label = getLabel(this.props.label, this.props.model, this.props.id);
        return (
            <Grid className='name-renderer' fluid={true}>
                <Row>
                    <Col md={12}>
                        <h2>{label}</h2>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Input
                            onChange={this._onChange.bind(this)}
                            placeholder='John Doe'
                            type='text'
                        />
                    </Col>
                </Row>
            </Grid>
        );
    }
}
