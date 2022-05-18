import React, { useState } from "react";
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
import { formatDistance, formatElevation } from "../../utils/unitConversions";
import { Units } from "../../data/useUnits";
import { useUnitsContext } from "../../contexts/Units";
import { SummarySegment } from "../../data/stravaDataTypes";
import { OAuth } from "../OAuth/OAuth";

import styles from "./Dashboard.module.css";
import typography from "../../styles/Typography.module.css";
import errorStyles from "../../styles/ErrorMessage.module.css";
import loadingStyles from "../../styles/LoadingMessage.module.css";

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

    function setCurrentSegmentId(sid: string) {
        history.pushState(null, "", "?s=" + sid);
        setQueryParams({authorizationCode: queryParams.authorizationCode, segmentId: sid});
    }

    if (isStarredError) {
        const err = starredError;

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

    if (!currentSegment) {
        currentSegment = starred?.find(item => String(item.id) === segmentId);        
    }
    const currentSegmentName = isStarredLoading ? "Loading..." : (currentSegment ? currentSegment.name : "Select a segment");

    starred?.sort((a, b) => {
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
              {starred?.map(item => (
                  <NavDropdown.Item key={item.id} className={styles.borderedItem} active={String(item.id) === segmentId} onClick={() => setCurrentSegmentId(String(item.id))}>
                        {item.name}&nbsp;{item.climb_category > 0 && <span className="badge rounded-pill bg-secondary">Cat {item.climb_category}</span>}
                        <br/>
                        ({formatDistance(units, item.distance)}, {formatElevation(units, item.elevation_high - item.elevation_low)}, {item.average_grade}% grade)
                  </NavDropdown.Item>
              ))}
          </div>
        </NavDropdown>
    );
};