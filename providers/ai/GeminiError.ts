export class ProviderError extends Error {
  public readonly code?: string
  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ProviderError'
    this.code = code
  }
}

export class RateLimitError extends ProviderError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT')
    this.name = 'RateLimitError'
  }
}

export class TimeoutError extends ProviderError {
  constructor(message = 'Request timed out') {
    super(message, 'TIMEOUT')
    this.name = 'TimeoutError'
  }
}

export class InvalidJSONError extends ProviderError {
  public readonly raw?: string
  constructor(message = 'Invalid JSON received from provider', raw?: string) {
    super(message, 'INVALID_JSON')
    this.name = 'InvalidJSONError'
    this.raw = raw
  }
}

export class UnauthorizedError extends ProviderError {
  constructor(message = 'Unauthorized - invalid API key') {
    super(message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}
