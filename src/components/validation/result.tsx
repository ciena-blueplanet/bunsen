/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

const _ = require('lodash');
import * as React from 'react';

import ErrorComponent from './error-component';

interface ResultProps {
    ref?: string;
    result: any;
}

export default class ResultComponent extends React.Component<ResultProps, {}> {
    public displayName: string = 'ValidationResult';

    /**
     * obvious
     * @returns {ReactComponent} the rendered component
     */
    public render(): React.ReactElement<any> {
        const warnings = _.map(this.props.result.warnings, (warning: any, index: number) => {
            return (
                <ErrorComponent
                    data={warning}
                    key={`warning-${index}`}
                    warning={true}
                />
            );
        });

        const errors = _.map(this.props.result.errors, (error: any, index: number) => {
            return (
                <ErrorComponent
                    data={error}
                    key={`error-${index}`}
                />
            );
        });

        return (
            <div>
                <h4>There seems to be something wrong with your schema</h4>
                <div className='image-wrapper'>
                    <code>Insert sad dinosaur image here</code>
                </div>
                {warnings}
                {errors}
            </div>
        );
    }
}
