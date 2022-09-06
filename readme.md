# Custom Arenanet Eslint Rules

This is intended to be included in `eslint-config-arenanet`, with all custom rules defaulted to off.

## Rule descriptions

### `mithril-view-must-return`

Mithril views must return something in order to be rendered.

### `must-await-playwright-expect`

Playwright can use sync or async `expect`. This rule enforces using the async behavior to avoid confusing behavior. https://playwright.dev/docs/test-assertions 

### `reply-with-request`

Guarantees backend response includes request object.

### `use-strict-at-top-of-document`

Warn user that `"use strict";` has not been expressed at the top of document.