import { useQuery } from "react-query";
import { DetailedActivity, DetailedSegment, SummarySegment, DetailedSegmentEffort } from "./stravaDataTypes";

const STRAVA_API_ENDPOINT = "https://www.strava.com/api/v3";

async function stravaAPI(path: string, token: string) {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${token}`);

    const response = await fetch(`${STRAVA_API_ENDPOINT}${path}`, { headers });
    if (!response.ok) {
        const msg = await response.json();
        throw new Error(msg.message);
    }

    return await response.json();
}

const queryOptions = {
    cacheTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
};

export function getStarredSegments(segmentSearch: string, token: string) {
    const starredResult = useQuery<SummarySegment[], Error>(
        "starred",
        () => stravaAPI(`/segments/starred?page=1&per_page=50`, token),
        queryOptions
    );
    return starredResult;
}

export function getDetailedSegment(segmentId: string, token: string) {
    return useQuery<DetailedSegment, Error>(
        "segment" + segmentId,
        () => stravaAPI(`/segments/${segmentId}`, token),
        queryOptions
    );
}

export function getSegmentEfforts(segmentId: string, yearRange: number[], numEfforts: number, token: string) {
    const startDate = new Date();
    startDate.setFullYear(yearRange[0]);
    startDate.setMonth(0);
    startDate.setDate(1);
    const endDate = new Date();
    endDate.setFullYear(yearRange[1]);
    endDate.setMonth(0);
    endDate.setDate(1);
    const opts = { 
        startDateLocal: startDate.toISOString(), // {Date} ISO 8601 formatted date time.
        endDateLocal: endDate.toISOString(), // {Date} ISO 8601 formatted date time.
        perPage: numEfforts // {Integer} Number of items per page. Defaults to 30.
    };
    /*
    const end = new Date(Date.now());
    const opts = { 
        startDateLocal: '2009-07-11T05:00:00+00:00', // {Date} ISO 8601 formatted date time.
        endDateLocal: end.toISOString(), // {Date} ISO 8601 formatted date time.
        perPage: numEfforts // {Integer} Number of items per page. Defaults to 30.
    };
    */
    const segmentEffortResult = useQuery<DetailedSegmentEffort[], Error>(
        "segmentEfforts" + segmentId + "/" + yearRange[0] + "-" + yearRange[1],
        () => stravaAPI(`/segment_efforts?segment_id=${segmentId}&start_date_local=${opts.startDateLocal}&end_date_local=${opts.endDateLocal}&per_page=${opts.perPage}`, token),
        queryOptions
    );
    const {
        isLoading: isSegmentEffortLoading,
        isError: isSegmentEffortError,
        data: segmentEfforts,
        error: segmentEffortError,
    } = segmentEffortResult;

    if (!isSegmentEffortLoading && !isSegmentEffortError && segmentEfforts) {
        /*
        console.log(segmentEfforts[0].activity.id);
        const activitiesResult = useQuery<DetailedActivity[], Error>(
            "activities" + segmentId,
            () => stravaAPI(`/activities/${segmentEfforts[0].activity.id}`, token),
            {
                cacheTime: Infinity,
                retry: false,
                refetchOnWindowFocus: false,
                enabled: segmentEfforts
            }
        );
        */
        
        /*
        const activitiesResult = useQuery<DetailedActivity[], Error>(
            "activities" + segmentId,
            () => {
                const requests = segmentEfforts.map((effort) => {
                    return stravaAPI(`/activities/${effort.activity.id}`, token);
                });
                return Promise.all(requests);
            },
            queryOptions
        );
        */
        /*
        const {
            isLoading: isActivitiesLoading,
            isError: isActivitiesError,
            data: activities,
            error: activitiesError,
        } = activitiesResult;
        if (!isActivitiesLoading && !isActivitiesError) {
            console.log(activities);
        }
        */
    }
    return segmentEffortResult;
}

export function getActivity(activityId: string, token: string) {
    return useQuery<DetailedActivity, Error>(
        "activities" + activityId,
        () => stravaAPI(`/activities/${activityId}`, token),
        queryOptions
    );
}
