/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react';
const Demo = require('cy-gh-pages/src/components/demo');
import DemoComponent from './code/number';

const demoSource = require('!!raw!./code/number');

export default class Number extends React.Component<{}, {}> {
    public displayName: string = 'NumberInputDemo';

    /* React method */
    public render(): React.ReactElement<any> {
        return (
            <Demo
                demoComponent={DemoComponent}
                demoSource={demoSource}
                fluid={false}
                horizontal={true}
            />
        );
    }
}
