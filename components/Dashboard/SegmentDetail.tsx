import React, { useState } from "react";
import cw from "classnames";

import Container from 'react-bootstrap/Container';

import { useAPITokenContext } from "../../contexts/APIToken";
import { useQueryParamsContext } from "../../contexts/QueryParams";
import { DetailedSegment, DetailedSegmentEffort } from "../../data/stravaDataTypes";
import { getDetailedSegment, getSegmentEfforts, getActivity } from "../../data/useStravaData";
import { SizeClass, useHorizontalSizeClass } from "../../utils/useSizeClass";
import { formatDistance, formatElevation, metersToMiles, elapsedTimeToString } from "../../utils/unitConversions";
import { useUnitsContext } from "../../contexts/Units";
import { useYAxisContext } from "../../contexts/YAxis";
import { getScatterData, scatterOptionsElapsedTime, scatterOptionsAvgWatts } from "../../data/scatter";
import { YAxis } from "../../data/useYAxis";
import { Units } from "../../data/useUnits";

import { OAuth } from "../OAuth/OAuth";

import styles from "./Dashboard.module.css";
import typography from "../../styles/Typography.module.css";
import errorStyles from "../../styles/ErrorMessage.module.css";
import loadingStyles from "../../styles/LoadingMessage.module.css";

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export const SegmentDetail: React.ComponentType<{
    yearRange: any | null;
    setYearRange: (value: any) => void;
}> = ({
    yearRange,
    setYearRange
}) => {
    const { tokenResponse } = useAPITokenContext();
    const { queryParams } = useQueryParamsContext();
    const sizeClass = useHorizontalSizeClass();
    const { units } = useUnitsContext();
    const { yAxis } = useYAxisContext();
    const segmentId = queryParams.segmentId;

    const { access_token } = tokenResponse;

    const segmentResult = getDetailedSegment(segmentId, access_token);
    const {
        isLoading: isSegmentLoading,
        isError: isSegmentError,
        data: segment,
        error: segmentError,
    } = segmentResult;

    const segmentEffortsResult = getSegmentEfforts(segmentId, yearRange, 200, access_token);
    const {
        isLoading: isSegmentEffortsLoading,
        isError: isSegmentEffortsError,
        data: segmentEfforts,
        error: segmentEffortsError,
    } = segmentEffortsResult;

    if (isSegmentLoading || isSegmentEffortsLoading) {
        return (
            <div className={loadingStyles.loadingMessage}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (isSegmentError || isSegmentEffortsError) {
        const err = segmentError;
        if (err?.message === "Authorization Error") {
            return <OAuth />;
        } else {
            return (
                <div className={errorStyles.errorMessage}>
                    <div
                        className={
                            sizeClass === SizeClass.COMPACT
                                ? errorStyles.compact
                                : errorStyles.regular
                        }
                    >
                        <h2
                            className={cw(
                                errorStyles.title,
                                typography.titleReduced
                            )}
                        >
                            Error.
                        </h2>
                        <p
                            className={cw(
                                errorStyles.description,
                                typography.bodyReduced
                            )}
                        >
                            {err?.message}
                        </p>
                    </div>
                </div>
            );
        }
    }

    const scatterData = typeof segmentEfforts !== "undefined" && segmentEfforts?.length > 1 ? getScatterData(yAxis, units, segmentEfforts) : null;
    const scatterOptions = yAxis == YAxis.ELAPSED_TIME ? scatterOptionsElapsedTime : scatterOptionsAvgWatts;

    const distance = segment ? formatDistance(units, segment.distance) : null;
    const elevation = segment ? formatElevation(units as Units, segment.elevation_high - segment.elevation_low) : null;

    return (
        <Container>
            <div className={styles.chartHeader}>
                <h6>
                    {segment && segment.climb_category > 0 &&
                        <span className="badge rounded-pill bg-secondary">Cat {segment.climb_category}</span>
                    }
                    {segment && segment.climb_category > 0 &&
                        <span>&nbsp;</span>
                    }
                    {segment &&
                        <span>{distance}&nbsp;&middot;&nbsp;{elevation}&nbsp;&middot;&nbsp;{segment.average_grade}%&nbsp;&nbsp;<img src={segment.elevation_profile}/></span>
                    }
                </h6>
                {segmentEfforts && segmentEfforts.length > 0 && segment &&
                    <h6>
                        <span>PR: {elapsedTimeToString(segment.athlete_segment_stats.pr_elapsed_time)} on {new Date(segment.athlete_segment_stats.pr_date).toLocaleDateString()}</span>
                        {segmentEfforts.length == 1 &&
                            <span>&nbsp;&middot;&nbsp;{segmentEfforts.length} effort</span>
                        }
                        {segmentEfforts.length > 1 && segmentEfforts.length < segment.athlete_segment_stats.effort_count &&
                            <span>&nbsp;&middot;&nbsp;{segmentEfforts.length} of {segment.athlete_segment_stats.effort_count} efforts</span>
                        }
                        {segmentEfforts.length > 1 && segmentEfforts.length == segment.athlete_segment_stats.effort_count &&
                            <span>&nbsp;&middot;&nbsp;{segmentEfforts.length} efforts</span>
                        }
                    </h6>
                }
                {!segmentEfforts || segmentEfforts.length == 0 &&
                    <h6>
                        <span>0 efforts (get out there and ride this segment!)</span>
                    </h6>
                }
            </div>
            {scatterData &&
                <div className={styles.scatterContainer}>
                    <Scatter options={scatterOptions} data={scatterData}/>
                </div>
            }
        </Container>
    );
};