import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, storedHash = '') {
  const [salt, hash] = storedHash.split(':')
  if (!salt || !hash) return false

  const candidate = hashPassword(password, salt).split(':')[1]
  return timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'))
}
