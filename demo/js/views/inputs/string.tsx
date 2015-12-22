/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react';
const Demo = require('cy-gh-pages/src/components/demo');
import DemoComponent from './code/string';

const demoSource = require('!!raw!./code/string');

export default class String extends React.Component<{}, {}> {
    public displayName: string = 'StringInputDemo';

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
