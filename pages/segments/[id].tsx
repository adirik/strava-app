import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import { useAPITokenContext } from "../../contexts/APIToken";
import { useQueryParamsContext } from "../../contexts/QueryParams";
import { getDetailedSegment } from "../../data/useStravaData";

export const Segment: React.ComponentType = () => {
//const Segment: NextPage = () => {
    const { tokenResponse } = useAPITokenContext();
    const { queryParams } = useQueryParamsContext();
    console.log(queryParams);
    return (
        <div>
            Segment!
        </div>
    );
}

/*
export async function getServerSideProps(context) {
    console.log("getServerSideProps");
    const { tokenResponse } = useAPITokenContext();
    const { queryParams } = useQueryParamsContext();
    console.log(queryParams);
    const detailedSegment = getDetailedSegment(access_token);
    console.log(detailedSegment);
    return {
        props: {}, // will be passed to the page component as props
    }
}
*/

export default Segment
