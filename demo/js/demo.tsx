/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import '../style/demo.less';

const ghPageFactory = require('cy-gh-pages');

import FormView from './views/forms';
import DetailView from './views/detail';

import ModelValidator from './views/validators/model';
import ViewValidator from './views/validators/view';
import ValueValidator from './views/validators/value';

import GeneratorView from './views/generator';

import StringInputDemo from './views/inputs/string';
import NumberInputDemo from './views/inputs/number';
import BooleanInputDemo from './views/inputs/boolean';
import PasswordInputDemo from './views/inputs/password';
import TextareaInputDemo from './views/inputs/textarea';

const views = [
    {
        name: 'Form',
        reactClass: FormView,
    },
    {
        name: 'Detail',
        reactClass: DetailView,
    },
    {
        name: 'Validators',
        subMenus: [
            {
                name: 'Model',
                reactClass: ModelValidator,
            },
            {
                name: 'View',
                reactClass: ViewValidator,
            },
            {
                name: 'Value',
                reactClass: ValueValidator,
            },
        ],
    },
    {
        name: 'Inputs',
        subMenus: [
            {
                name: 'String',
                reactClass: StringInputDemo,
            },
            {
                name: 'Number',
                reactClass: NumberInputDemo,
            },
            {
                name: 'Boolean',
                reactClass: BooleanInputDemo,
            },
            {
                name: 'Password',
                reactClass: PasswordInputDemo,
            },
            {
                name: 'Textarea',
                reactClass: TextareaInputDemo,
            },
        ],
    },
    {
        name: 'Generator',
        reactClass: GeneratorView,
    },
];

const ghPage = ghPageFactory('https://github.cyanoptics.com/UI/cy-bunsen', views);

document.addEventListener('DOMContentLoaded', () => {
    ghPage.buildLayout();
});
