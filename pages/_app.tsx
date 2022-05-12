import '../styles/globals.css'
import type { AppProps } from 'next/app'
import 'bootstrap/dist/css/bootstrap.css'

function SafeHydrate({ children }: { children: React.ReactNode }) {
    return (
        <div suppressHydrationWarning>
            {typeof window === "undefined" ? null : children}
        </div>
    );
}

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <SafeHydrate>
            <Component {...pageProps} />
        </SafeHydrate>
    );
}

export default MyApp
