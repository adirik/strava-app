import React, { useState } from "react";
import Link from "next/link";
import cw from "classnames";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Search } from 'react-bootstrap-icons';

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
        history.pushState(null, null, "?s=" + sid);
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

    var currentSegment = starred.find(item => item.id == segmentId);
    const currentSegmentName = currentSegment ? currentSegment.name : "Select a segment";

    starred.sort((a, b) => {
        return (b.elevation_high - b.elevation_low) - (a.elevation_high - a.elevation_low);
    });

    return (
        <NavDropdown title={currentSegmentName} id="basic-nav-dropdown">
          <div className={styles.searchForm}>
              <Form className="d-flex">
                <FormControl
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                />
                <Button variant="outline-success"><Search/></Button>
              </Form>
          </div>
          <div className={styles.scrollableMenu}>
              {starred.map(item => (
                  <NavDropdown.Item className={styles.borderedItem} active={item.id == segmentId} onClick={() => setCurrentSegmentId(item.id)}>
                        {item.name}&nbsp;{item.climb_category > 0 && <span className="badge rounded-pill bg-secondary">Cat {item.climb_category}</span>}
                        <br/>
                        ({formatDistance(units, item.distance)}, {formatElevation(units, item.elevation_high - item.elevation_low)}, {item.average_grade}% grade)
                  </NavDropdown.Item>
              ))}
          </div>
        </NavDropdown>
    );
};