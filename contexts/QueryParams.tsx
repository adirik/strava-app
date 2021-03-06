import * as React from "react";
import { useState } from "react";

export interface QueryParams {
    //routeId: string;
    //segmentIds: string[];
    segmentId: string,
    authorizationCode: string | null;
}
export interface QueryParamsCtx {
    queryParams: QueryParams;
    setQueryParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

export const QueryParamsContext = React.createContext<QueryParamsCtx>(
    {} as QueryParamsCtx
);

export const QueryParamsProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [queryParams, setQueryParams] = useState<QueryParams>(
        parseQueryParams()
    );

    return (
        <QueryParamsContext.Provider value={{ queryParams, setQueryParams }}>
            {children}
        </QueryParamsContext.Provider>
    );
};

export const useQueryParamsContext = (): QueryParamsCtx => {
    return React.useContext(QueryParamsContext);
};

export function parseQueryParams(): QueryParams {
    const params =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams();
    /*
    const routeId = params.get("r") || "";
    const segmentIds = (
        params.get("s") ||
        params.get("amp;s") ||
        params.get("amp;amp;s") ||
        ""
    ).split(",");
    */
    const authorizationCode = params.get("code");
    const segmentId = params.get("s") || "";
    return {
        //routeId,
        segmentId,
        authorizationCode,
    } as QueryParams;
}

export function isQueryParamsValid(): boolean {
    /*
    const { routeId, segmentIds } = parseQueryParams();
    return [routeId, ...segmentIds].every((val) => /^\d+$/.test(val || ""));
    */
    return true;
}

export function clearOAuthQueryParams() {
    /*
    const { routeId, segmentIds } = parseQueryParams();
    window.history.pushState({}, "", `?r=${routeId}&s=${segmentIds.join(",")}`);
    */
}
