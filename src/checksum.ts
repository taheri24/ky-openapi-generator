/**
 * Checksum utilities for file integrity verification
 */

import * as crypto from 'crypto';
import * as fs from 'fs';

export type ChecksumMethod = 'crc32' | 'md5' | 'sha1' | 'sha256';

/**
 * Calculate checksum of a file using the specified method
 */
export function calculateChecksum(filePath: string, method: ChecksumMethod = 'md5'): string {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  if (method === 'crc32') {
    return calculateCRC32(fileContent);
  }

  const hash = crypto.createHash(method);
  hash.update(fileContent, 'utf-8');
  return hash.digest('hex');
}

/**
 * CRC32 implementation for file checksums
 */
function calculateCRC32(data: string): string {
  const table = new Uint32Array(256);

  // Build CRC32 lookup table
  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) === 1 ? 0xedb88320 : 0);
    }
    table[i] = crc >>> 0;
  }

  // Calculate CRC32
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data.charCodeAt(i)) & 0xff];
  }
  crc = crc ^ 0xffffffff;

  return (crc >>> 0).toString(16).padStart(8, '0');
}
