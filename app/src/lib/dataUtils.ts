/**
 * Utility: safeParseJsonArray
 * 
 * Hardens the parsing of database fields that might be stored as either 
 * JSONB arrays OR JSON-encoded strings. Prevents runtime crashes from 
 * malformed data or nulls.
 */
export function safeParseJsonArray<T = any>(input: any): T[] {
  if (!input) return [];
  
  // If it's already an array, return it directly
  if (Array.isArray(input)) {
    return input as T[];
  }
  
  // If it's a string, try to parse it
  if (typeof input === 'string') {
    try {
      const trimmed = input.trim();
      if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
        return [];
      }
      
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  
  return [];
}

/**
 * Utility: safeParseJsonObject
 * 
 * Hardens the parsing of database fields that might be stored as either 
 * JSONB objects OR JSON-encoded strings.
 */
export function safeParseJsonObject<T = any>(input: any): T | null {
  if (!input) return null;
  
  // If it's already an object (and not an array), return it
  if (typeof input === 'object' && !Array.isArray(input)) {
    return input as T;
  }
  
  if (typeof input === 'string') {
    try {
      const trimmed = input.trim();
      if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
        return null;
      }
      
      const parsed = JSON.parse(trimmed);
      return (typeof parsed === 'object' && !Array.isArray(parsed)) ? (parsed as T) : null;
    } catch {
      return null;
    }
  }
  
  return null;
}
