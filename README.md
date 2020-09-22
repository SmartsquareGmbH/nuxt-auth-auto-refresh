# nuxt-auth-auto-refresh [![](https://github.com/SmartsquareGmbH/nuxt-auth-auto-refresh/workflows/CI/badge.svg)](https://github.com/SmartsquareGmbH/nuxt-auth-auto-refresh/actions?query=workflow%3ACI) [![](https://badgen.net/npm/v/nuxt-auth-auto-refresh)](https://www.npmjs.com/package/nuxt-auth-auto-refresh)

Automatic (periodic) token refresh for the Nuxt Auth Module v5.

The current Auth Module only refreshes tokens before requests. This can be problematic when the user is staying on a page for a longer time without calling any apis or when the token livetime is very short. This plugin helps by refreshing near to expire tokens automatically in the background. 

:warning: v5 is not considered stable yet, use with caution.

### Installation

##### Yarn

```
yarn add nuxt-auth-auto-refresh
```

##### Npm

```
npm i nuxt-auth-auto-refresh
```

### Usage

Add the plugin to the `plugins` array of the Auth Module in your `nuxt.config.js`.

```js
auth: {
    // Other config...
    plugins: [{ src: "node_modules/nuxt-auth-auto-refresh/dist/index.js", ssr: false }]
}
```

> This is not the normal plugins block. Nuxt Auth has it's own to make it possible to build on it.

### Internals

The plugin works by searching periodically (every 500ms) for soon to expire tokens.
A token is considered "soon to expire" when it has exceeded 75% of it's lifetime (the difference between `iat` and `exp`) but is not completely expired yet.
If such a token is found, the `refreshTokens()` function of the Auth Module is called.
