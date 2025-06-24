import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const callbackUrl = requestUrl.searchParams.get('callbackUrl');

    console.log('[OAuth Callback] callbackUrl:', callbackUrl, '| code:', code, '| requestUrl:', requestUrl.toString());

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    async get(name: string) {
                        const cookie = await cookieStore.get(name);
                        return cookie?.value;
                    },
                    async set(name: string, value: string, options: CookieOptions) {
                        await cookieStore.set(name, value, options);
                    },
                    async remove(name: string, options: CookieOptions) {
                        await cookieStore.delete(name, options);
                    },
                },
            }
        );
        
        // Échanger le code contre une session
        await supabase.auth.exchangeCodeForSession(code);
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL(callbackUrl || '/', requestUrl.origin));
} 