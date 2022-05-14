import React, { useState } from "react";
import Link from "next/link";
import cw from "classnames";

import { useAPITokenContext } from "../../contexts/APIToken";
import { useQueryParamsContext } from "../../contexts/QueryParams";
import { DetailedSegment, DetailedSegmentEffort } from "../../data/stravaDataTypes";
import { getDetailedSegment, getSegmentEfforts, getActivity } from "../../data/useStravaData";
import { SizeClass, useHorizontalSizeClass } from "../../utils/useSizeClass";
import { metersToFeet, metersToMiles } from "../../utils/unitConversions";
import { Units } from "../../data/useUnits";
import { useUnitsContext } from "../../contexts/Units";

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

const START_YEAR = 2009;

function elapsedTimeToString(elapsed: number): string {
    const minutes = Math.floor(elapsed/60);
    const secondsStr = `${elapsed % 60}`;
    return minutes + ':' + secondsStr.padStart(2, '0');
}

function effortDay(startYear, date) {
    const year = date.getFullYear();
    const result = Math.floor((date - new Date(year, 0, 0)) / 1000 / 60 / 60 / 24);
    return result + 365 * (year - startYear + 1);
}

function getActivityIdFromElement(elems) {
    if (elems && elems[0] && elems[0].element["$context"]) {
        var ctx = elems[0].element["$context"];
        return ctx.raw.a;
    } else {
        return null;
    }
}

export const scatterOptions = {
    onClick: function(evt, elems) {
        var activityId = getActivityIdFromElement(elems);
        if (activityId) {
            window.open('https://www.strava.com/activities/' + activityId, '_blank');
        }
    },
    onHover: function(evt, elems) {
        var activityId = getActivityIdFromElement(elems);
        evt.native.target.style.cursor = activityId ? 'pointer' : 'default';
    },
    scales: {
        y: {
            //beginAtZero: true,
            reverse: true,
            ticks: {
                callback: function(value, index, ticks) {
                    return elapsedTimeToString(value);
                }
            }
        },
        x: {
            min: effortDay(START_YEAR, new Date('2009-01-01T00:00:00 00:00')),
            ticks: {
                stepSize: 365,
                callback: function(value, index, ticks) {
                    return Math.floor(value/365) + START_YEAR - 1;                    
                }
            }
        }
    },
    plugins: {
        legend: {
            labels: {
                filter: function(item) {
                    return !item.text.includes('Best effort line');
                }
            }
        },
        tooltip: {
            filter: function(context, data) {
                return context.dataset.order < 4;
            },
            callbacks: {
                label: function(context) {
                    if (context.raw.isBest || context.raw.isWorst) {
                        return '';
                    }
                    let label = elapsedTimeToString(context.parsed.y);
                    label += ' on ' + new Date(context.raw.d).toLocaleDateString();
                    label += ', ' + context.raw.w + 'w';
                    label += ', ' + context.raw.v;
                    label += context.raw.u === Units.IMPERIAL ? 'mi/h' : 'km/h';
                    return label;
                },
                title: function(context) {
                    if (context.length > 0) {
                        var title = '';
                        if (context[0].raw && context[0].raw.r) {
                            title += context[0].raw.r;
                        }
                        switch(context[0].dataset.order) {
                            case 0:
                                title += ' (Outlier)';
                                break;
                            case 1:
                                title += ' (Best Effort)';
                                break;
                            case 2:
                                title += ' (Worst Effort)';
                                break;
                        }
                    }
                    return title;
                },
                footer: function(context) {
                    if (context.length > 0) {
                        return '(Click to view in Strava)';
                    } else {
                        return '';
                    }
                }
            },
            titleAlign: 'center',
            footerAlign: 'center',
        }
    }
};

// https://www.scribbr.com/statistics/outliers/
function calculateOutlierEfforts(sortedSegmentEfforts) {
    const result = [];
    const medianIndex = Math.trunc(sortedSegmentEfforts.length / 2);
    const qtrIndex = Math.trunc(medianIndex/2);
    const q1Effort = sortedSegmentEfforts[qtrIndex];
    const q3Effort = sortedSegmentEfforts[medianIndex + qtrIndex];
    const iqr = q3Effort.elapsed_time - q1Effort.elapsed_time;
    const upperFence = q3Effort.elapsed_time + (1.5 * iqr);
    const lowerFence = q1Effort.elapsed_time - (1.5 * iqr); // not used
    const index = 0;
    while (index < sortedSegmentEfforts.length) {
        if (sortedSegmentEfforts[index].elapsed_time > upperFence) {
            result.push(sortedSegmentEfforts[index]);
            sortedSegmentEfforts.splice(index, 1);
        } else {
            index++;
        }
    }
    return result;
}

// https://hazlo.medium.com/linear-regression-from-scratch-in-js-first-foray-into-ml-for-web-developers-867cfcae8fde
function calculateLinearRegression(segmentEfforts) {
    const x_values = [], y_values = [];
    segmentEfforts.forEach((item) => {
        x_values.push(effortDay(START_YEAR, new Date(item.start_date)));
        y_values.push(item.elapsed_time);
    });
    const x_mean = x_values.reduce((a, b) => a + b, 0)/x_values.length;
    const y_mean = y_values.reduce((a, b) => a + b, 0)/y_values.length;

    const slope_numerator = 0, slope_denominator = 0;
    x_values.forEach((x, i) => {
        slope_numerator += (x - x_mean) * (y_values[i] - y_mean);
        slope_denominator += Math.pow((x - x_mean), 2);
    });

    const slope = slope_numerator / slope_denominator;
    const intercept = y_mean - x_mean * slope;
    const data = [];
    x_values.forEach((x, i) => {
        data.push({
            x: x,
            y: x * slope + intercept
        });
    });
    return data;
}

function segmentEffortToDataPoint(units: Units, effort: DetailedSegmentEffort, isBest: boolean = false, isWorst: boolean = false, isOutlier: boolean = false) {
    var distance = units === Units.IMPERIAL ? metersToMiles(effort.distance) : effort.distance/1000;
    return {
        x: effortDay(START_YEAR, new Date(effort.start_date)),
        y: effort.elapsed_time,
        d: effort.start_date,
        w: effort.average_watts,
        a: effort.activity.id,
        r: effort.rank,
        v: Math.round(distance/effort.elapsed_time*3600*10)/10,
        u: units,
        isBest: isBest,
        isWorst: isWorst,
        isOutlier: isOutlier
    };
}

function getScatterData(units, segmentEfforts) {
    const sortedSegmentEfforts = segmentEfforts.slice();
    sortedSegmentEfforts.sort((a, b) => {
        return a.elapsed_time - b.elapsed_time;
    });
    sortedSegmentEfforts.forEach((item, index) => {
        item.rank = (index+1) + '/' + sortedSegmentEfforts.length;
    });
    const outlierEfforts = calculateOutlierEfforts(sortedSegmentEfforts);
    const bestEffort = sortedSegmentEfforts[0];
    const worstEffort = sortedSegmentEfforts[sortedSegmentEfforts.length - 1];

    const linearRegressionData = calculateLinearRegression(sortedSegmentEfforts);

    const datedSegmentEfforts = segmentEfforts.slice();
    datedSegmentEfforts.sort((a, b) => {
        return new Date(a.start_date) - new Date(b.start_date);
    });
    const firstEffort = datedSegmentEfforts[0];
    const lastEffort = datedSegmentEfforts[datedSegmentEfforts.length - 1];

    const scatterData = {
        datasets: [
            {
                label: sortedSegmentEfforts.length > 1 ? 'Other efforts' : 'Efforts',
                data: sortedSegmentEfforts.map(item => (
                    segmentEffortToDataPoint(
                        units,
                        item,
                        sortedSegmentEfforts.length > 1 && item == bestEffort,
                        sortedSegmentEfforts.length > 1 && item == worstEffort)
                    )
                ),
                backgroundColor: 'rgba(0, 99, 255, 1)',
                order: 3,
            },
        ],
    };

    if (sortedSegmentEfforts.length > 1) {
        scatterData.datasets.push({
            label: 'Best effort',
            data: [segmentEffortToDataPoint(units, bestEffort)],
            backgroundColor: 'rgba(0, 255, 99, 1)',
            order: 1,
        },
        {
            label: 'Worst effort',
            data: [segmentEffortToDataPoint(units, worstEffort)],
            backgroundColor: 'rgba(255, 99, 132, 1)',
            order: 2,
        },
        {
            type: 'line',
            label: 'Trend',
            data: linearRegressionData.map(item => ({
                x: item.x,
                y: item.y,
                isTrend: true
            })),
            backgroundColor: 'rgba(192, 192, 192, 1)',
            borderColor: 'rgba(192, 192, 192, 1)',
            borderWidth: 2,
            pointStyle: 'line',
            order: 4,
        },
        {
            type: 'line',
            label: 'Best effort line',
            data: [
                { x: effortDay(START_YEAR, new Date(firstEffort.start_date)), y: bestEffort.elapsed_time },
                { x: effortDay(START_YEAR, new Date(lastEffort.start_date)), y: bestEffort.elapsed_time },
            ],
            borderColor: 'rgba(0, 255, 99, 1)',
            borderWidth: 1,
            borderDash: [5, 5],
            pointStyle: 'line',
            order: 5,
        });
    }

    if (outlierEfforts.length > 0) {
        scatterData.datasets.push({
            label: 'Outliers',
            data: outlierEfforts.map(item => (
                segmentEffortToDataPoint(
                    units,
                    item,
                    false,
                    false,
                    true)
                )
            ),
            backgroundColor: 'rgba(255, 165, 0, 1)',
            order: 0,
        });
    }

    return scatterData;
}

export const SegmentDetail: React.ComponentType<> = () => {
    const { tokenResponse } = useAPITokenContext();
    const { queryParams } = useQueryParamsContext();
    const sizeClass = useHorizontalSizeClass();
    const { units } = useUnitsContext();
    const segmentId = queryParams.segmentId;

    const { access_token } = tokenResponse;

    const segmentResult = getDetailedSegment(segmentId, access_token);
    const {
        isLoading: isSegmentLoading,
        isError: isSegmentError,
        data: segment,
        error: segmentError,
    } = segmentResult;

    const segmentEffortsResult = getSegmentEfforts(segmentId, 200, access_token);
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
       /*
            <div className={loadingStyles.loadingMessage}>
                <h2 className={cw(loadingStyles.title, typography.titleReduced)}>
                    Loading...
                </h2>
            </div>
            */
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

    const scatterData = segmentEfforts.length > 1 ? getScatterData(units, segmentEfforts) : null;
 
    return (
        <div className={styles.detailContainer}>
            <h3>
                {segment.name}&nbsp;<img src={segment.elevation_profile}/>
            </h3>
            <h4>
                {segmentEfforts.length == 0 &&
                    <span>{segmentEfforts.length} efforts</span>
                }
                {segmentEfforts.length == 1 &&
                    <span>{segmentEfforts.length} effort</span>
                }
                {segmentEfforts.length > 1 && segmentEfforts.length < segment.athlete_segment_stats.effort_count &&
                    <span>Showing {segmentEfforts.length} of {segment.athlete_segment_stats.effort_count} efforts</span>
                }
                {segmentEfforts.length > 1 && segmentEfforts.length == segment.athlete_segment_stats.effort_count &&
                    <span>{segmentEfforts.length} efforts</span>
                }
                {segmentEfforts.length > 0 &&
                    <span>, PR {elapsedTimeToString(segment.athlete_segment_stats.pr_elapsed_time)} on {new Date(segment.athlete_segment_stats.pr_date).toLocaleDateString()}</span>
                }
            </h4>
            {scatterData != null &&
                <div className={styles.scatterContainer}>
                    <Scatter options={scatterOptions} data={scatterData} />
                </div>
            }
        </div>
    );
};