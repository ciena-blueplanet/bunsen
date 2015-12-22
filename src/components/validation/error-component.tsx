/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react';

interface ErrorComponentProps {
    data?: any;
    key?: string;
    warning?: boolean;
}

export default class ErrorComponent extends React.Component<ErrorComponentProps, {}> {
    public static defaultProps: ErrorComponentProps = {
        warning: false
    };

    public displayName: string = 'ErrorComponent';

    /**
     * obvious
     * @returns {ReactComponent} the rendered component
     */
    public render(): React.ReactElement<any> {
        const classNames = ['alert'];

        if (this.props.warning) {
            classNames.push('alert-warning');
        } else {
            classNames.push('alert-danger');
        }

        return (
            <div className={classNames.join(' ')}>
                <strong>{this.props.data.path + ' '}</strong>
                {this.props.data.message}
            </div>
        );
    }
}
