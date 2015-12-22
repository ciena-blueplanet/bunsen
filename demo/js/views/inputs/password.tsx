/**
 * @author Matthew Dahl <mdahl@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import * as React from 'react';
const Demo = require('cy-gh-pages/src/components/demo');
import DemoComponent from './code/password';

const demoSource = require('!!raw!./code/password');

export default class Password extends React.Component<{}, {}> {
    public displayName: string = 'PasswordInputDemo';

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
