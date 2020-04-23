
import { parseUserId } from './utils'

export function getUserId(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header')
  
    if (!authHeader.toLowerCase().startsWith('bearer ')) throw new Error('Invalid authentication header')
    
    const split = authHeader.split(' ')
    const token = split[1]
    return parseUserId(token) 

}