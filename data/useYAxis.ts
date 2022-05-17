import { useLocalStorage } from "./useLocalStorage";

export enum YAxis {
    ELAPSED_TIME = "elapsed_time",
    AVG_WATTS = "average_watts",
}

export function isYAxisAscending(yAxis: YAxis): boolean {
    switch(yAxis) {
        case YAxis.ELAPSED_TIME:
            return false;
        case YAxis.AVG_WATTS:
            return true;
        default:
            throw "Unrecognized YAxis value: " + yAxis;
    }

}

export function useYAxis() {
    const key = "strava_app.yAxis";
    return useLocalStorage<YAxis>(key, YAxis.ELAPSED_TIME);
}
