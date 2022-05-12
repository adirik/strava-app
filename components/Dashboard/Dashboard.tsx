import React, { useState } from "react";
import { Helmet } from "react-helmet";
import cw from "classnames";

import { StarredSegments } from "../Dashboard/StarredSegments";
import { SegmentDetail } from "../Dashboard/SegmentDetail";
import { Controls } from "../Dashboard/Controls";
import { UnitsProvider } from "../../contexts/Units";

import styles from "./Dashboard.module.css";

export const Dashboard: React.ComponentType = () => {
    const [currentSegment, setCurrentSegment] = useState<any>(null);

    return (
        <div>
            <UnitsProvider>
                <Controls />
                <div className={styles.dashboardContainer}>
                    <Helmet>
                        <meta charSet="utf-8" />
                        <title>Starred Segment Analyzer</title>
                    </Helmet>
                    <StarredSegments currentSegment={currentSegment} setCurrentSegment={setCurrentSegment}/>
                    <SegmentDetail />
                </div>
            </UnitsProvider>
        </div>
    );
};