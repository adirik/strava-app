import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from "react-router-dom";
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
                        <BrowserRouter>
                            <App />
                        </BrowserRouter>
                    </AuthStateProvider>
                </APITokenProvider>
            </QueryParamsProvider>
        </QueryClientProvider>
    );
}

export default Home
