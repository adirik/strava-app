import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import { QueryClient, QueryClientProvider } from 'react-query'
import { App } from '../components/App/App'
import { QueryParamsProvider } from '../contexts/QueryParams'
import { APITokenProvider } from '../contexts/APIToken'
import { AuthStateProvider } from '../contexts/AuthState'

export const queryClient = new QueryClient();

const Home: NextPage = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <QueryParamsProvider>
                <APITokenProvider>
                    <AuthStateProvider>
                        <App />
                    </AuthStateProvider>
                </APITokenProvider>
            </QueryParamsProvider>
        </QueryClientProvider>
    );
}

export default Home
