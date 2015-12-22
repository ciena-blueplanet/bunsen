/**
 * @author Matthew Dahl <mdahl@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react';
const Demo = require('cy-gh-pages/src/components/demo');
import DemoComponent from './code/textarea';

const demoSource = require('!!raw!./code/textarea');

export default class Textarea extends React.Component<{}, {}> {
    public displayName: string = 'TextareaInputDemo';

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
