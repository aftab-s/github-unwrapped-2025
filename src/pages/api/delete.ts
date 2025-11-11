import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteCachedStats } from '@/lib/cache';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    await deleteCachedStats(username);
    return res.status(200).json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting cached data:', error);
    return res.status(500).json({ error: 'Failed to delete data' });
  }
}
