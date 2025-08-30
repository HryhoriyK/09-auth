import { NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '../api';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const search = request.nextUrl.searchParams.get('search') ?? '';
    const page = Number(request.nextUrl.searchParams.get('page') ?? 1);
    const rawTag = request.nextUrl.searchParams.get('tag') ?? '';
    const tag = rawTag === 'All' ? '' : rawTag;

    const res = await api('/notes', {
      params: {
        ...(search !== '' && { search }),
        page,
        perPage: 12,
        ...(tag && { tag }),
      },
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
        return NextResponse.json(
          {
            error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
          },
          { status: (error as ApiError).status }
        )
      }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const body = await request.json();

    const res = await api.post('/notes', body, {
      headers: {
        Cookie: cookieStore.toString(),
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
        return NextResponse.json(
          {
            error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
          },
          { status: (error as ApiError).status }
        )
      }
}
