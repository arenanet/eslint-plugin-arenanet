const rule = require("../index").rules["use-strict-at-top-of-document"];
const error = require("../index").errors.ERROR_USE_STRICT_AT_TOP;
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({ parserOptions : { ecmaVersion : 2017 } });

ruleTester.run("use-strict-at-top-of-document", rule, {
    valid : [
        {
            code : `
"use strict";

function test() {}
`
        }
    ],
    invalid : [
        {
            code : `
function test() {}
`,
            errors : [{ message : error }]
        },
    ]
})