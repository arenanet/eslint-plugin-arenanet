const rule = require("../index").rules["reply-with-request"];
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({ parserOptions : { ecmaVersion : 2017 } });

ruleTester.run("reply-with-request", rule, {
    valid : [
        {
            code : "reply({ req })"
        },
        {
            code : "reply({ req : {} })"
        },
        {
            code : "reply.json({}, { req })"
        },
        {
            code : "reply.json({}, { req : {} })"
        },
        {
            code : "reply.template({}, {}, { req })"
        },
        {
            code : "reply.template({}, {}, { req : {} })"
        }
    ],
    invalid : [
        {
            code : "reply()",
            errors : [{ message : "Reply must respond with request" }]
        },
        {
            code : "reply({})",
            errors : [{ message : "Reply must respond with request" }]
        },
        {
            code : "reply.json({})",
            errors : [{ message : "Reply must respond with request" }]
        },
        {
            code : "reply.json({}, {})",
            errors : [{ message : "Reply must respond with request" }]
        },
        {
            code : "reply.template({})",
            errors : [{ message : "Reply must respond with request" }]
        },
        {
            code : "reply.template({}, {})",
            errors : [{ message : "Reply must respond with request" }]
        }
    ]
})