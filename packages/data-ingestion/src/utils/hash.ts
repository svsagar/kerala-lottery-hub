import crypto from 'crypto';

export const calculateContentHash = async (content: string | Buffer): Promise<string> => {
  const data = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const verifyContentHash = async (content: string | Buffer, hash: string): Promise<boolean> => {
  const calculatedHash = await calculateContentHash(content);
  return calculatedHash === hash;
};
