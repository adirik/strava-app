import { useLocalStorage } from "./useLocalStorage";

export enum Units {
    IMPERIAL = "imperial",
    METRIC = "metric",
}

export function useUnits() {
    const key = "strava_app.units";
    return useLocalStorage<Units>(key, Units.IMPERIAL);
}
