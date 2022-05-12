import React, { useState } from "react";
import Link from "next/link";
import cw from "classnames";

import { useAPITokenContext } from "../../contexts/APIToken";
import { useQueryParamsContext } from "../../contexts/QueryParams";
import { DetailedSegment } from "../../data/stravaDataTypes";
import { getStarredSegments, getDetailedSegment } from "../../data/useStravaData";
import { SizeClass, useHorizontalSizeClass } from "../../utils/useSizeClass";
import { distanceStr, elevationStr, unitsStr, metersToFeet, metersToMiles } from "../../utils/unitConversions";
import { Units } from "../../data/useUnits";
import { useUnitsContext } from "../../contexts/Units";

import { OAuth } from "../OAuth/OAuth";

import styles from "./Dashboard.module.css";
import typography from "../../styles/Typography.module.css";
import errorStyles from "../../styles/ErrorMessage.module.css";
import loadingStyles from "../../styles/LoadingMessage.module.css";

function elapsedTimeToString(elapsed: number): string {
    const minutes = Math.floor(elapsed/60);
    const secondsStr = `${elapsed % 60}`;
    return minutes + ':' + secondsStr.padStart(2, '0');
}

const unitsStyle = {
  fontSize: 'smaller'
};

function formatDistance(units: Units, distance: number): string {
    return <span><span>{distanceStr(units, distance)}</span><span style={unitsStyle}>{unitsStr(units, "km")}</span></span>;
}

function formatElevation(units: Units, distance: number): string {
    return <span><span>{elevationStr(units, distance)}</span><span style={unitsStyle}>{unitsStr(units, "m")}</span></span>;
}

export const StarredSegments: React.ComponentType<{
    currentSegment: any | null;
    setCurrentSegment: (value: any) => void;
}> = ({
    currentSegment,
    setCurrentSegment
}) => {
    const { tokenResponse } = useAPITokenContext();
    const { queryParams, setQueryParams } = useQueryParamsContext();
    const sizeClass = useHorizontalSizeClass();
    const segmentId = queryParams.segmentId;
    const { units } = useUnitsContext();

    const { access_token } = tokenResponse;
    const starredResult = getStarredSegments(access_token);
    const {
        isLoading: isStarredLoading,
        isError: isStarredError,
        data: starred,
        error: starredError,
    } = starredResult;

    if (isStarredLoading) {
        return (
            <div className={loadingStyles.loadingMessage}>
                <h2 className={cw(loadingStyles.title, typography.titleReduced)}>
                    Starred Segments Loading...
                </h2>
            </div>
        );
    }

    function setCurrentSegmentId(sid) {
        setQueryParams({segmentId: sid});
    }

    if (isStarredError) {
        const err = isStarredError;

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

    starred.sort((a, b) => {
        return (b.elevation_high - b.elevation_low) - (a.elevation_high - a.elevation_low);
    });

    return (
        <div className={styles.starredContainer}>
            <ul className="list-group">
                {starred.map(item => (
                    <li
                        key={item.id}
                        onClick={() => setCurrentSegmentId(item.id)}
                    >
                        <Link
                            href={{
                                pathname: '/',
                                query: { s: item.id },
                            }}
                        >
                            <a className={cw("list-group-item", "list-group-item-action", {active: item.id == segmentId})} style={{textDecoration: 'none'}}>
                                {item.name}&nbsp;{item.climb_category > 0 && <span className="badge rounded-pill bg-secondary">Cat {item.climb_category}</span>}
                                <br/>
                                ({formatDistance(units, item.distance)}, {formatElevation(units, item.elevation_high - item.elevation_low)}, {item.average_grade}% grade)
                            </a>
                        </Link>
                    </li>
                ))}
            </ul>
            {/*
            <table>
                <thead>
                    <tr>
                        <th>Segment Name</th>
                        <th>Distance (mi)</th>
                        <th>Elevation (ft)</th>
                        <th>Avg Grade (%)</th>
                        <th>Cat</th>
                        <th># Efforts</th>
                        <th>PR</th>
                        <th>PR Date</th>
                    </tr>
                </thead>
                <tbody>
                    {starred.map(item => (
                        <tr key={item.id}>
                            <th><Link href={`/segments/${encodeURIComponent(item.id)}`}><a>{item.name}</a></Link></th>
                            <td>{Math.round(metersToMiles(item.distance)*100)/100}</td>
                            <td>{Math.round(metersToFeet(item.elevation_high - item.elevation_low))}</td>
                            <td>{Math.round(item.average_grade*100)/100}%</td>
                            <td>{item.climb_category}</td>
                            <td>{item.athlete_segment_stats?.effort_count}</td>
                            <td>{elapsedTimeToString(item.athlete_pr_effort.elapsed_time)}</td>
                            <td>{new Date(item.athlete_pr_effort.start_date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            */}
        </div>
    );
};