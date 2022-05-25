import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Container from 'react-bootstrap/Container';

import { SegmentDetail } from "../Dashboard/SegmentDetail";
import { Controls } from "../Dashboard/Controls";
import { UnitsProvider } from "../../contexts/Units";
import { YAxisProvider } from "../../contexts/YAxis";

import styles from "./Dashboard.module.css";

export const Dashboard: React.ComponentType = () => {
    const [ searchParams, setSearchParams ] = useSearchParams();
    const segmentId = searchParams.get("s");
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