import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Store } from '@/models/Store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  try {
    await dbConnect();
    const stores = await Store.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 1000
        }
      }
    });
    
    return NextResponse.json(stores);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
} 