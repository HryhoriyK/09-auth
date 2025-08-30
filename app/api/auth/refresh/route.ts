import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api, ApiError } from '../../api';
import { parse } from 'cookie';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;
    const next = request.nextUrl.searchParams.get('next') || '/';

    if (refreshToken) {
      const apiRes = await api.get('auth/session', {
        headers: {
          Cookie: cookieStore.toString(),
        },
      });
      const setCookie = apiRes.headers['set-cookie'];
      if (setCookie) {
        const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
        let accessToken = '';
        let refreshToken = '';

        for (const cookieStr of cookieArray) {
          const parsed = parse(cookieStr);
          if (parsed.accessToken) accessToken = parsed.accessToken;
          if (parsed.refreshToken) refreshToken = parsed.refreshToken;
        }

        if (accessToken) cookieStore.set('accessToken', accessToken);
        if (refreshToken) cookieStore.set('refreshToken', refreshToken);

        return NextResponse.redirect(new URL(next, request.url), {
          headers: {
            'set-cookie': cookieStore.toString(),
          },
        });
      }
    }
    return NextResponse.redirect(new URL('/sign-in', request.url));
  } catch (error) {
      return NextResponse.json(
        {
          error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
        },
        { status: (error as ApiError).status }
      )
    }
}