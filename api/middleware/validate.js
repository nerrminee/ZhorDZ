import { createError } from './errorHandler.js'

function isEmpty(value) {
  return value === undefined || value === null || value === ''
}

function validateValue(value, rules) {
  const errors = []

  if (rules.required && isEmpty(value)) {
    errors.push(`${rules.field} is required`)
    return errors
  }

  if (isEmpty(value)) {
    return errors
  }

  if (rules.type) {
    const expectedType = rules.type.toLowerCase()
    if (expectedType === 'string' && typeof value !== 'string') {
      errors.push(`${rules.field} must be a string`)
    }

    if (expectedType === 'number' && typeof value !== 'number') {
      errors.push(`${rules.field} must be a number`)
    }

    if (expectedType === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${rules.field} must be a boolean`)
    }

    if (expectedType === 'array' && !Array.isArray(value)) {
      errors.push(`${rules.field} must be an array`)
    }

    if (expectedType === 'object' && (typeof value !== 'object' || Array.isArray(value) || value === null)) {
      errors.push(`${rules.field} must be an object`)
    }

    if (expectedType === 'email' && typeof value === 'string') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(value)) {
        errors.push(`${rules.field} must be a valid email`)
      }
    }
  }

  if (rules.minLength && typeof value === 'string' && value.trim().length < rules.minLength) {
    errors.push(`${rules.field} must be at least ${rules.minLength} characters`)
  }

  if (rules.maxLength && typeof value === 'string' && value.trim().length > rules.maxLength) {
    errors.push(`${rules.field} must be at most ${rules.maxLength} characters`)
  }

  if (rules.min && typeof value === 'number' && value < rules.min) {
    errors.push(`${rules.field} must be at least ${rules.min}`)
  }

  if (rules.max && typeof value === 'number' && value > rules.max) {
    errors.push(`${rules.field} must be at most ${rules.max}`)
  }

  if (rules.enum && !rules.enum.includes(value)) {
    errors.push(`${rules.field} must be one of: ${rules.enum.join(', ')}`)
  }

  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    errors.push(`${rules.field} format is invalid`)
  }

  return errors
}

export function validateRequest(schema, data = {}) {
  const errors = {}

  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field]
    const fieldErrors = validateValue(value, { ...rules, field })

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors
    }
  })

  if (Object.keys(errors).length > 0) {
    throw createError('Validation failed', 400, 'VALIDATION_ERROR', errors)
  }
}
