const errors = {
    ERROR_MITHRIL_VIEW_MUST_RETURN : "Mithril view must return",
    ERROR_MSG_NO_REQ_FOUND : "Reply must respond with request",
    ERROR_MUST_AWAIT_PLAYWRIGHT_EXPECT : "Playwright expect must use await",
    ERROR_USE_STRICT_AT_TOP : "use strict must be at top of document"
};

/**
 * This is the error that shows up in the tooltip and CLI when eslint is running.
 * @param {object} context - eslint context, helpful for rules to do their job
 * @param {object} node - node being looked at in the AST
 * @param {string} message - error message
 * @param {function} [fix] - autofixes the code
 * @returns
 */
function report({ context, node, message, fix = new Function() }) {
    return context.report({
        node,
        message,
        fix
    });
}

module.exports = {
    rules : {
        "mithril-view-must-return" : {
            create : function(context) {
                return {
                    Property(node) {
                        if (node.key.name !== "view") {
                            return;
                        }

                        if (node.value.type !== "FunctionExpression" && node.value.type !== "ArrowFunctionExpression") {
                            return report({ context, node, message : errors.ERROR_MITHRIL_VIEW_MUST_RETURN });
                        }

                        function returnFound(body = []) {
                            return body.some((node) => {
                                if (node.type === "IfStatement") {
                                    return returnFound(node.consequent.body);
                                }

                                if (node.type === "SwitchStatement") {
                                    return node.cases.some((switchCase) => returnFound(switchCase.consequent));
                                }

                                if (node.type === "ReturnStatement") {
                                    return true;
                                }
                            });
                        }

                        // captures:
                        // { view() {} }
                        // { view : () => {} }
                        // no need to check if it's neither of these, if it's an arrow return then the rule is satisfied
                        if (node.value.type === "FunctionExpression" || node.value.body.type === "BlockStatement") {
                            const returnStatement = returnFound(node.value.body.body);

                            if (!returnStatement) {
                                return report({ context, node, message : errors.ERROR_MITHRIL_VIEW_MUST_RETURN });
                            }
                        }
                    }
                };
            }
        },
        "must-await-playwright-expect" : {
            meta : {
                type : "problem",
                docs : {
                    description: "Playwright's `expect` can be sync or async. This rule enforces the use of the async pattern to avoid confusing behavior."
                },
                fixable : "code"
            },
            create : function(context) {
                return {
                    ExpressionStatement(node) {
                        const isExpect = node.expression &&
                              node.expression.callee &&
                              node.expression.callee.object &&
                              node.expression.callee.object.callee &&
                              node.expression.callee.object.callee.name === "expect";

                        if (isExpect && node.expression.type !== "AwaitExpression") {
                            return report({
                                context,
                                node,
                                message : errors.ERROR_MUST_AWAIT_PLAYWRIGHT_EXPECT,
                                fix : function(fixer) {
                                    return fixer.insertTextBefore(node, "await ");
                                }
                            });
                        }
                    }
                  };
            }
        },
        "reply-with-request" : {
            create : function(context) {
                return {
                    CallExpression(node) {
                        const isBaseReply   = node.callee.name; // reply()
                        const isReplyMethod = node.callee.object && node.callee.object.name; // reply.json() || reply.template(), etc
                        const calleeName  = isBaseReply || isReplyMethod;

                        if (calleeName !== "reply" || !node.arguments) {
                            return;
                        }

                        let arg;

                        if (isBaseReply) {
                            arg = node.arguments[0];
                        } else {
                            const replyMethodType = node.callee.property.name;

                            if (replyMethodType === "template") {
                                arg = node.arguments[2];
                            } else {
                                arg = node.arguments[1];
                            }
                        }

                        if (!arg) {
                            return report({ context, node, message : errors.ERROR_MSG_NO_REQ_FOUND });
                        }

                        const properties = arg.properties;

                        if (!properties) {
                            return report({ context, node, message : errors.ERROR_MSG_NO_REQ_FOUND });
                        }

                        const hasReq = Boolean(properties.filter((prop) => prop.key && prop.key.name === "req").length);

                        if (!hasReq) {
                            return report({ context, node, message : errors.ERROR_MSG_NO_REQ_FOUND });
                        }
                    }
                };
            }
        },
        "use-strict-at-top-of-document" : {
            meta : {
                type : "problem",
                fixable : "code"
            },
            create : function(context) {
                return {
                    Program(node) {
                        const firstChild = node.body[0];

                        if (!firstChild) {
                            return;
                        }

                        if (firstChild.type !== "ExpressionStatement" || firstChild.expression.value !== "use strict") {
                            return report({
                                context,
                                node,
                                message : errors.ERROR_USE_STRICT_AT_TOP,
                                fix(fixer) {
                                    fixer.insertTextBefore(node, `"use strict";\n\n`);
                                }
                            });
                        }
                    }
                };
            }
        }
    },
    errors
};
