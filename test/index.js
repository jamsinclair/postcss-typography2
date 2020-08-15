const fs = require('fs');
const path = require('path');

const test = require('tape');
const postcss = require('postcss');
const typography = require('..');

const read = fs.readFileSync;
const {join} = path;

const ROOT = join(__dirname, 'fixtures');

const fixtures = fs.readdirSync(ROOT);

function prettify() {
	return function (css) {
		css.walkRules((rule, index) => {
			if (index !== 0) {
				rule.raws.before = '\n';
			}

			rule.raws.between = ' ';
			rule.raws.after = '\n';
		});

		css.walkDecls((decl, index) => {
			if (index !== 0) {
				decl.raws.before = '\n';
			}

			decl.raws.before = '\n    ';
			decl.raws.between = ': ';
		});
	};
}

test('typography()', t => {
	t.is(typeof typography, 'function', 'should be a function');

	t.doesNotThrow(() => {
		typography();
	}, '');

	t.end();
});

test('fixtures', async t => {
	const tests = fixtures.filter(filepath => {
		return filepath.indexOf('.') !== 0;
	}).map(async fixture => {
		const filepath = join(ROOT, fixture);
		const output = read(join(filepath, 'output.css'), 'utf-8');
		const input = read(join(filepath, 'input.css'), 'utf-8');
		const config = require(join(filepath, 'config.js'));
		const processor = postcss([typography(config), prettify()]);
		const result = await processor.process(input).css;

		t.deepEqual(result, output, `should work on \`${fixture}\``);
	});

	await Promise.all(tests);
});
