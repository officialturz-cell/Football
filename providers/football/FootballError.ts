export class FootballProviderError extends Error {
  public readonly code?: string
  constructor(message: string, code?: string) {
    super(message)
    this.name = 'FootballProviderError'
    this.code = code
  }
}

export class FootballRateLimitError extends FootballProviderError {
  constructor(message = 'Football provider rate limit exceeded') {
    super(message, 'RATE_LIMIT')
    this.name = 'FootballRateLimitError'
  }
}

export class FootballTimeoutError extends FootballProviderError {
  constructor(message = 'Football provider request timed out') {
    super(message, 'TIMEOUT')
    this.name = 'FootballTimeoutError'
  }
}

export class FootballNotFoundError extends FootballProviderError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND')
    this.name = 'FootballNotFoundError'
  }
}

export class FootballUnauthorizedError extends FootballProviderError {
  constructor(message = 'Unauthorized - invalid API key') {
    super(message, 'UNAUTHORIZED')
    this.name = 'FootballUnauthorizedError'
  }
}
