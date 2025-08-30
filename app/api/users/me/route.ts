export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { api, ApiError } from '../../api';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();

    const res = await api.get('/users/me', {
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

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();

    const res = await api.patch('/users/me', body, {
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