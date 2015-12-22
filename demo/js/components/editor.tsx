/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/keymap/vim';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
const codeMirror = require('codemirror');

interface EditorProps {
    initialValue?: string;
    onChange?: any;
    ref?: any;
    valid?: boolean;
    varName?: string;
    vimMode?: boolean;
}

interface EditorState {
    value?: any;
}

export default class Editor extends React.Component<EditorProps, EditorState> {
    public static defaultProps: EditorProps = {
        initialValue: '',
        valid: false,
        vimMode: false,
    };

    public displayName: string = 'Editor';
    public editor: any;

    constructor(props: EditorProps) {
        super(props);

        this.state = {
            value: this.props.initialValue
        };
    }

    /**
     * Get the className attribute for the editor (based on validation result)
     * @returns {String} the className attribute
     */
    private _getEditorClassName(): string {
        const wrapperClasses = ['editor-wrapper'];

        if (this.props.valid !== undefined) {
            wrapperClasses.push(this.props.valid ? 'bg-success' : 'bg-danger');
        }

        return wrapperClasses.join(' ');
    }

    /** obvious */
    public componentDidMount(): void {
        const editorWrapper: any = ReactDOM.findDOMNode(this);
        this.editor = codeMirror(editorWrapper, {
            value: this.state.value,
            mode: {
                name: 'javascript',
                json: true,
            },
            indentUnit: 4,
            smartIndent: true,
            keyMap: this.props.vimMode ? 'vim' : 'default',
        });

        this.editor.on('change', () => {
            const value = this.editor.getValue();
            if (this.props.onChange) {
                this.props.onChange(value);
            }

            // This isn't actually inside the componentDidMount, but rather in the change handler
            /* eslint-disable react/no-did-mount-set-state */
            this.setState({value});
            /* eslint-enable react/no-did-mount-set-state */
        });

        // initial onChange event for first set of data
        if (this.props.onChange) {
            this.props.onChange(this.editor.getValue());
        }

        // expose the editor instance (if varName is given)
        if (this.props.varName) {
            window[this.props.varName] = this.editor;
        }
    }

    /** obvious */
    public componentDidUpdate(): void {
        this.editor.setOption('keyMap', this.props.vimMode ? 'vim' : 'default');
    }

    /**
     * obvious
     * @returns {ReactComponent} the rendered DOM
     */
    public render(): React.ReactElement<any> {
        return (
            <div className={this._getEditorClassName()}>
            </div>
        );
    }
}
