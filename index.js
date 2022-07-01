const ERROR_MSG_NO_REQ_FOUND = "Reply must respond with request";
const ERROR_USE_STRICT_AT_TOP = "use strict must be at top of document";

function report(context, node, message) {
    return context.report({
        node,
        message
    });
}

module.exports = {
    rules : {
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
                            return report(context, node, ERROR_MSG_NO_REQ_FOUND);
                        }

                        const properties = arg.properties;

                        if (!properties) {
                            return report(context, node, ERROR_MSG_NO_REQ_FOUND);
                        }

                        const hasReq = Boolean(properties.filter((prop) => prop.key && prop.key.name === "req").length);

                        if (!hasReq) {
                            return report(context, node, ERROR_MSG_NO_REQ_FOUND);
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

                        if (firstChild.type !== "ExpressionStatement") {
                            return report(context, node, ERROR_USE_STRICT_AT_TOP);
                        }

                        if (firstChild.expression.value !== "use strict") {
                            return report(context, node, ERROR_USE_STRICT_AT_TOP);
                        }
                    }
                }
            }
        }
    },
    errors : {
        ERROR_MSG_NO_REQ_FOUND,
        ERROR_USE_STRICT_AT_TOP
    }
};
