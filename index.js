const errors = {
    ERROR_MITHRIL_VIEW_MUST_RETURN : "Mithril view must return",
    ERROR_MSG_NO_REQ_FOUND : "Reply must respond with request",
    ERROR_USE_STRICT_AT_TOP : "use strict must be at top of document"
};

function report(context, node, message) {
    return context.report({
        node,
        message
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
                            return report(context, node, errors.ERROR_MITHRIL_VIEW_MUST_RETURN);
                        }

                        function returnFound(body) {
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
                                return report(context, node, errors.ERROR_MITHRIL_VIEW_MUST_RETURN);
                            }
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
                            return report(context, node, errors.ERROR_MSG_NO_REQ_FOUND);
                        }

                        const properties = arg.properties;

                        if (!properties) {
                            return report(context, node, errors.ERROR_MSG_NO_REQ_FOUND);
                        }

                        const hasReq = Boolean(properties.filter((prop) => prop.key && prop.key.name === "req").length);

                        if (!hasReq) {
                            return report(context, node, errors.ERROR_MSG_NO_REQ_FOUND);
                        }
                    }
                };
            }
        },
        "use-strict-at-top-of-document" : {
            create : function(context) {
                return {
                    Program(node) {
                        const firstChild = node.body[0];

                        if (!firstChild) {
                            return;
                        }

                        if (firstChild.type !== "ExpressionStatement") {
                            return report(context, node, errors.ERROR_USE_STRICT_AT_TOP);
                        }

                        if (firstChild.expression.value !== "use strict") {
                            return report(context, node, errors.ERROR_USE_STRICT_AT_TOP);
                        }
                    }
                };
            }
        }
    },
    errors
};
