import dbConnect from '@/lib/mongoose';
import { Store } from '@/models/Store';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // Now you can use the Store model
  const stores = await Store.find({});
  res.status(200).json(stores);
} 