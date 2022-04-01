const ERROR_MSG_NO_REQ_FOUND = "Reply must respond with request";

function report(context, node) {
    return context.report({
        node,
        message : ERROR_MSG_NO_REQ_FOUND
    });
}

module.exports = {
    rules : {
        "reply-with-request" : {
            create : function(context) {
                return {
                    CallExpression(node) {
                        const baseReply   = node.callee.name; // reply()
                        const methodReply = node.callee.object && node.callee.object.name; // reply.json() || reply.template(), etc
                        const calleeName  = baseReply || methodReply;

                        if (calleeName !== "reply") {
                            return;
                        }

                        const arg = baseReply ? node.arguments[0] : node.arguments[1];

                        if (!arg || !arg.properties) {
                            return report(context, node);
                        }

                        const hasReq = Boolean(arg.properties.filter((prop) => prop.key && prop.key.name === "req").length);

                        if (!hasReq) {
                            return report(context, node);
                        }
                    }
                };
            }
        }
    }
};
