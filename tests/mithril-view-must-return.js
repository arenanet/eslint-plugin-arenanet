const rule = require("../index").rules["mithril-view-must-return"];
const error = require("../index").errors.ERROR_MITHRIL_VIEW_MUST_RETURN;
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({ parserOptions : { ecmaVersion : 2017, sourceType : "module" } });

ruleTester.run("mithril-view-must-return", rule, {
    valid : [
        {
            code : `
export default {
    view : () => ""
}`
        },
        {
            code : `
const component = {
    view() {
        return "";
    }
}`
        },
        {
            code : `
const component = {
    view : () => {
        return "";
    }
}`
        },
        {
            code : `
const component = {
    view() {
        const foo = 1;

        if (foo) {
            if (true) {
                console.log("foo");
            }
            console.log("foo");
        }

        return "";
    }
}`
        },
        {
            code : `
const component = {
    view() {
        const foo = 1;

        if (foo) {
            if (true) {
                return "";
            }
            console.log("foo");
        }
    }
}`
        },
        {
            code :`
const component = {
    view() {
        const foo = 1;

        switch(foo) {
            case 1:
            case 2:
            default:
                return "";
        }
    }
}`
        },
        {
            code :`
const component = {
    view() {
        const foo = 1;

        switch(foo) {
            case 1: return "";
            default: return "";
        }
    }
}`
        }
    ],
    invalid : [
        {
            code : `
const component = {
    view() {
        const a = true;
    }
}`,
            errors : [{ message : error }]
        },
        {
            code : `
const component = {
    view : () => {
        const a = true;
    }
}`,
            errors : [{ message : error }]
        },
        {
            code : `
const component = {
    view : () => {
        if (true) {
            console.log("foo");
        }
    }
}`,
            errors : [{ message : error }]
        },
        {
            code : `
const component = {
    view() {
        const foo = 1;

        switch (foo) {
            case 1:
                console.log("foo");
            default:
                console.log("goo");
        }
    }
}`,
            errors : [{ message : error }]
        }
    ]
});