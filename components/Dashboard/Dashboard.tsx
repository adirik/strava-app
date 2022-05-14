import React, { useEffect, useState } from "react";
import cw from "classnames";

import { SegmentDetail } from "../Dashboard/SegmentDetail";
import { Controls } from "../Dashboard/Controls";
import { UnitsProvider } from "../../contexts/Units";
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
                <Controls />
                <div className={styles.dashboardContainer}>
                    {segmentId &&
                        <SegmentDetail />
                    }
                </div>
            </UnitsProvider>
        </div>
    );
};