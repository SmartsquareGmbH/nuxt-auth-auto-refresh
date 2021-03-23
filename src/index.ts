import { Auth, Scheme, TokenableScheme } from "@nuxtjs/auth-next"
import jwtDecode from "jwt-decode"

type AuthToken = {
  get(): any
}

type JwtToken = {
  exp: number
  iat: number
}

function shouldRefresh(token: AuthToken): boolean {
  try {
    const decodedToken = jwtDecode<JwtToken>(token.get())
    const timeToLive = decodedToken.exp * 1000 - decodedToken.iat * 1000
    const timeDifference = decodedToken.exp * 1000 - new Date().getTime()
    const timeExpired = timeToLive - timeDifference

    if (timeExpired / timeToLive >= 0.75) {
      return true
    } else {
      return false
    }
  } catch (ignored) {
    return false
  }
}

function isTokenableScheme(scheme: Scheme): scheme is TokenableScheme {
  return "token" in scheme
}

export default function ({ $auth }: { $auth: Auth }) {
  setInterval(async () => {
    const strategies = $auth.strategies as { [key: string]: Scheme }

    const hasTokenToRefresh = Object.values(strategies).reduce((acc, scheme) => {
      if (!isTokenableScheme(scheme)) return false

      const token = scheme.token

      if (token && !token?.status()?.expired()) {
        return acc || shouldRefresh(token)
      } else {
        return acc || false
      }
    }, false)

    if (hasTokenToRefresh) {
      await $auth.refreshTokens()
    }
  }, 500)
}
