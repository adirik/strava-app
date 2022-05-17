import { calculateOutliers, calculateLinearRegression, DataPoint } from "./stats";
import { formatDistance, formatElevation, metersToMiles, elapsedTimeToString, effortDay } from "../utils/unitConversions";
import { Units } from "./useUnits";
import { YAxis, isYAxisAscending } from "./useYAxis";

const START_YEAR = 2009;

function getActivityIdFromElement(elems) {
    if (elems && elems[0] && elems[0].element["$context"]) {
        var ctx = elems[0].element["$context"];
        return ctx.raw.a;
    } else {
        return null;
    }
}

export const scatterOptionsElapsedTime = {
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
                    let label = elapsedTimeToString(context.raw.t);
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

export const scatterOptionsAvgWatts = {
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
        /*
        y: {
            //beginAtZero: true,
            reverse: true,
            ticks: {
                callback: function(value, index, ticks) {
                    return elapsedTimeToString(value);
                }
            }
        },
        */
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
                    let label = elapsedTimeToString(context.raw.t);
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

function segmentEffortToDataPoint(field: YAxis, units: Units, effort: DetailedSegmentEffort, isBest: boolean = false, isWorst: boolean = false, isOutlier: boolean = false) {
    var distance = units === Units.IMPERIAL ? metersToMiles(effort.distance) : effort.distance/1000;
    return {
        x: effortDay(START_YEAR, new Date(effort.start_date)),
        y: effort[field],
        d: effort.start_date,
        w: effort.average_watts,
        a: effort.activity.id,
        r: effort.rank,
        t: effort.elapsed_time,
        v: Math.round(distance/effort.elapsed_time*3600*10)/10,
        u: units,
        isBest: isBest,
        isWorst: isWorst,
        isOutlier: isOutlier
    };
}

export function getScatterData(field: YAxis, units: Units, segmentEfforts: DetailedSegmentEffort[]) {
    if (!field) field = YAxis.ELAPSED_TIME;
    const ascending = isYAxisAscending(field);
    const sortedSegmentEfforts = segmentEfforts.slice();
    sortedSegmentEfforts.sort((a, b) => {
        return ascending ? b[field] - a[field] : a[field] - b[field];
    });
    sortedSegmentEfforts.forEach((item, index) => {
        item.rank = (index+1) + '/' + sortedSegmentEfforts.length;
    });
    const outlierEfforts = calculateOutliers(sortedSegmentEfforts, field);
    const bestEffort = sortedSegmentEfforts[0];
    const worstEffort = sortedSegmentEfforts[sortedSegmentEfforts.length - 1];

    const x_values = [], y_values = [];
    segmentEfforts.forEach((item) => {
        x_values.push(effortDay(START_YEAR, new Date(item.start_date)));
        y_values.push(item[field]);
    });
    const linearRegressionData = calculateLinearRegression(x_values, y_values);

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
                        field,
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
            data: [segmentEffortToDataPoint(field, units, bestEffort)],
            backgroundColor: 'rgba(0, 255, 99, 1)',
            order: 1,
        },
        {
            label: 'Worst effort',
            data: [segmentEffortToDataPoint(field, units, worstEffort)],
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
                { x: effortDay(START_YEAR, new Date(firstEffort.start_date)), y: bestEffort[field] },
                { x: effortDay(START_YEAR, new Date(lastEffort.start_date)), y: bestEffort[field] },
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
                    field,
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
