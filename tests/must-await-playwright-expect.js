const rule = require("../index").rules["must-await-playwright-expect"];
const error = require("../index").errors.ERROR_MUST_AWAIT_PLAYWRIGHT_EXPECT;
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({ parserOptions : { ecmaVersion : 2017 } });

ruleTester.run("must-await-playwright-expect", rule, {
    valid : [
        {
            code : `
async function foo() {
    await expect("goo").toBe("goo");
}`
        }
    ],
    invalid : [
        {
            code : `
async function foo() {
    expect("goo").toBe("goo");
}`,
            output : `
async function foo() {
    await expect("goo").toBe("goo");
}`,
            errors : [{ message : error }]
        }
    ]
});
