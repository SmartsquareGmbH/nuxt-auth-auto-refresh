import jwt from "jsonwebtoken"
import plugin from "../src"

jest.useFakeTimers()

test("refresh token about to expire", () => {
  const callback = jest.fn()

  const $auth = {
    strategies: {
      refresh: {
        token: {
          get() {
            const nowSeconds = new Date().getTime() / 1000

            return jwt.sign(
              {
                exp: nowSeconds + 10,
                iat: nowSeconds - 100,
              },
              "secret"
            )
          },
          status() {
            return {
              expired() {
                return false
              },
            }
          },
        },
      },
    },
    refreshTokens: callback,
  } as any

  plugin({ $auth })

  jest.runOnlyPendingTimers()

  expect(callback).toBeCalled()
})

test("do not refresh not expiring soon", () => {
  const callback = jest.fn()

  const $auth = {
    strategies: {
      refresh: {
        token: {
          get() {
            const nowSeconds = new Date().getTime() / 1000

            return jwt.sign(
              {
                exp: nowSeconds + 100,
                iat: nowSeconds - 10,
              },
              "secret"
            )
          },
          status() {
            return {
              expired() {
                return false
              },
            }
          },
        },
      },
    },
    refreshTokens: callback,
  } as any

  plugin({ $auth })

  jest.runOnlyPendingTimers()

  expect(callback).toBeCalledTimes(0)
})

test("multiple strategies", () => {
  const callback = jest.fn()

  const $auth = {
    strategies: {
      refreshIrrlevant: {
        token: {
          get() {
            const nowSeconds = new Date().getTime() / 1000

            return jwt.sign(
              {
                exp: nowSeconds + 100,
                iat: nowSeconds - 10,
              },
              "secret"
            )
          },
          status() {
            return {
              expired() {
                return false
              },
            }
          },
        },
      },
      refresh: {
        token: {
          get() {
            const nowSeconds = new Date().getTime() / 1000

            return jwt.sign(
              {
                exp: nowSeconds + 10,
                iat: nowSeconds - 100,
              },
              "secret"
            )
          },
          status() {
            return {
              expired() {
                return false
              },
            }
          },
        },
      },
    },
    refreshTokens: callback,
  } as any

  plugin({ $auth })

  jest.runOnlyPendingTimers()

  expect(callback).toBeCalled()
})

test("ignore expired token", () => {
  const callback = jest.fn()

  const $auth = {
    strategies: {
      refresh: {
        token: {
          get() {
            const nowSeconds = new Date().getTime() / 1000

            return jwt.sign(
              {
                exp: nowSeconds + 10,
                iat: nowSeconds - 100,
              },
              "secret"
            )
          },
          status() {
            return {
              expired() {
                return true
              },
            }
          },
        },
      },
    },
    refreshTokens: callback,
  } as any

  plugin({ $auth })

  jest.runOnlyPendingTimers()

  expect(callback).toBeCalledTimes(0)
})

test("ignore invalid token", () => {
  const callback = jest.fn()

  const $auth = {
    strategies: {
      refresh: {
        token: {
          get() {
            const nowSeconds = new Date().getTime() / 1000

            return "invalid"
          },
          status() {
            return {
              expired() {
                return false
              },
            }
          },
        },
      },
    },
    refreshTokens: callback,
  } as any

  plugin({ $auth })

  jest.runOnlyPendingTimers()

  expect(callback).toBeCalledTimes(0)
})
