import React, { useEffect, useState } from "react";

import { SegmentDetail } from "../Dashboard/SegmentDetail";
import { Controls } from "../Dashboard/Controls";
import { UnitsProvider } from "../../contexts/Units";
import { YAxisProvider } from "../../contexts/YAxis";
import { useQueryParamsContext } from "../../contexts/QueryParams";

import styles from "./Dashboard.module.css";

export const Dashboard: React.ComponentType = () => {
    const { queryParams } = useQueryParamsContext();
    const segmentId = queryParams.segmentId;

    useEffect(() => {
        document.title = `Starred Segment Analyzer`;
    });

    return (
        <div>
            <UnitsProvider>
                <YAxisProvider>
                    <Controls />
                    {segmentId &&
                        <SegmentDetail />
                    }
                </YAxisProvider>
            </UnitsProvider>
        </div>
    );
};