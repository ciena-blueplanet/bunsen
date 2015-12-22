/**
 * @author Adam Meadows <ameadows@ciena.com>
 * @copyright 2015 Ciena Corporation. All rights reserved.
 */

/**
 * Shared spec to verify proper props are passed to the underlying input
 * @param {Object} ctx - the context object
 * @param {Object} ctx.component - the rendered component
 * @param {String} ctx.bsStyle - the expected bootstrap style
 * @param {String} ctx.className - the expected css classes
 * @param {String} ctx.dataId - the data-id on the input
 * @param {String} ctx.help - help text (for error message)
 * @param {String} ctx.label - user visible label
 * @param {String} ctx.labelClassName - CSS class for the label
 * @param {String} ctx.type - the type of input
 * @param {String} ctx.wrapperClassName - CSS class for the input wrapper
 */
export function itSetsPropsOnInput(ctx: any): void {
    describe('(shared) input props', () => {
        let component, ref;
        let bsStyle, className, dataId, help, label, labelClassName, type, wrapperClassName;

        beforeEach(() => {
            component = ctx.component;
            ref = component.refs.input;

            bsStyle = ctx.bsStyle;
            className = ctx.className;
            dataId = ctx.dataId;
            help = ctx.help;
            label = ctx.label;
            labelClassName = ctx.labelClassName;
            type = ctx.type;
            wrapperClassName = ctx.wrapperClassName;
        });

        it('sets the bsStyle', () => {
            expect(ref.props.bsStyle).to.equal(bsStyle);
        });

        it('sets the className', () => {
            expect(ref.props.className).to.equal(className);
        });

        it('sets the data-id', () => {
            expect(ref.props['data-id']).to.equal(dataId);
        });

        it('sets the help', () => {
            expect(ref.props.help).to.equal(help);
        });

        it('sets the label', () => {
            expect(ref.props.label).to.equal(label);
        });

        it('sets the labelClassName', () => {
            expect(ref.props.labelClassName).to.equal(labelClassName);
        });

        it('sets the type', () => {
            expect(ref.props.type).to.equal(type);
        });

        it('sets the wrapperClassName', () => {
            expect(ref.props.wrapperClassName).to.equal(wrapperClassName);
        });
    });
}
