import { YAxis, isYAxisAscending } from "./useYAxis";

// https://www.scribbr.com/statistics/outliers/
export function calculateOutliers(sortedArray: Array<any>, field: YAxis): Array<any> {
    const result = [];
    const ascending = isYAxisAscending(field);
    const medianIndex = Math.trunc(sortedArray.length / 2);
    const qtrIndex = Math.trunc(medianIndex/2);
    const q1Effort = ascending ? sortedArray[medianIndex + qtrIndex] : sortedArray[qtrIndex];
    const q3Effort = ascending ? sortedArray[qtrIndex] : sortedArray[medianIndex + qtrIndex];
    const iqr = q3Effort[field] - q1Effort[field];
    const upperFence = q3Effort[field] + (1.5 * iqr);
    const lowerFence = q1Effort[field] - (1.5 * iqr);
    const index = 0;
    while (index < sortedArray.length) {
        if ((ascending && sortedArray[index][field] < lowerFence) ||
            (!ascending && sortedArray[index][field] > upperFence)) {
            result.push(sortedArray[index]);
            sortedArray.splice(index, 1);
        } else {
            index++;
        }
    }
    return result;
}

export interface DataPoint {
    x: number;
    y: number;
};

// https://hazlo.medium.com/linear-regression-from-scratch-in-js-first-foray-into-ml-for-web-developers-867cfcae8fde
export function calculateLinearRegression(x_values: Array<number>, y_values: Array<number>): Array<DataPoint> {
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
