import React, { useEffect, useState } from "react";

import Container from 'react-bootstrap/Container';

import { SegmentDetail } from "../Dashboard/SegmentDetail";
import { Controls } from "../Dashboard/Controls";
import { UnitsProvider } from "../../contexts/Units";
import { YAxisProvider } from "../../contexts/YAxis";
import { useQueryParamsContext } from "../../contexts/QueryParams";

import styles from "./Dashboard.module.css";

export const Dashboard: React.ComponentType = () => {
    const { queryParams } = useQueryParamsContext();
    const segmentId = queryParams.segmentId;
    const [ yearRange, setYearRange ] = useState<number[]>([2013, 2023]);

    useEffect(() => {
        document.title = `Starred Segment Analyzer`;
    });

    return (
        <div>
            <UnitsProvider>
                <YAxisProvider>
                    <Controls yearRange={yearRange} setYearRange={setYearRange}/>
                    {segmentId &&
                        <SegmentDetail yearRange={yearRange} setYearRange={setYearRange}/>
                    }
                </YAxisProvider>
            </UnitsProvider>
        </div>
    );
};