import React, { useState } from "react";
import { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import cw from "classnames";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Search } from 'react-bootstrap-icons';

import { useAPITokenContext } from "../../contexts/APIToken";
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
    const [ searchParams, setSearchParams ] = useSearchParams();
    const segmentId = searchParams.get("s");

    const sizeClass = useHorizontalSizeClass();
    const { units } = useUnitsContext();
    const [ segmentSearch, setSegmentSearch ] = useState<any>('');

    const { access_token } = tokenResponse;
    const starredResult = getStarredSegments(access_token);
    const {
        isLoading: isStarredLoading,
        isError: isStarredError,
        data: starred,
        error: starredError,
    } = starredResult;

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

    var filtered = starred?.slice();
    if (!isStarredLoading) {
        const segmentSearchLowerCase = segmentSearch.toLowerCase();
        filtered = starred?.filter(item => {
            if (!segmentSearch || segmentSearch.length == 0) {
                return true;
            } else {
                return item.name.toLowerCase().includes(segmentSearchLowerCase);
            }
        });
    }

    const navDropdownStyle = {
        fontWeight: 'bold',
        fontSize: '16px',
    };

    function formatSegmentName(segmentName: string): ReactElement | string {
        if (segmentSearch && segmentSearch.length > 0) {
            const regex = new RegExp(segmentSearch, 'i');
            const splits = segmentName.split(regex);
            const matches = segmentName.match(regex);
            const matchStyle = {
                fontWeight: 'bold',
                backgroundColor: 'yellow',
                color: 'black',
            };
            if (splits && matches) {
                const matchRight = splits.length == 2 ? splits[1] : splits.slice(1).join();
                return <span><span>{splits[0]}</span><span style={matchStyle}>{matches[0]}</span><span>{matchRight}</span></span>;
            }
        }
        return segmentName;
    }

    return (
        <NavDropdown title={currentSegmentName} style={navDropdownStyle} id="basic-nav-dropdown">
          <div className={styles.searchForm}>
              <Form className="d-flex">
                <FormControl
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                  onChange={(e) => setSegmentSearch(e.target.value)}
                />
              </Form>
          </div>
          <div className={styles.scrollableMenu}>
              {isStarredLoading &&
                  <div className={styles.emptyDropdown}>
                        Loading starred segments...
                  </div>
              }
              {segmentSearch && filtered?.length === 0 &&
                  <div className={styles.emptyDropdown}>
                        <i>No segments found with &quot;{segmentSearch}&quot;</i>
                  </div>
              }
              {filtered?.map(item => (
                  <NavDropdown.Item key={item.id} className={styles.borderedItem} active={String(item.id) === segmentId} onClick={() => setSearchParams({s: String(item.id)})}>
                        {formatSegmentName(item.name)}&nbsp;{item.climb_category > 0 && <span className="badge rounded-pill bg-secondary">Cat {item.climb_category}</span>}
                        <br/>
                        ({formatDistance(units, item.distance)}, {formatElevation(units, item.elevation_high - item.elevation_low)}, {item.average_grade}% grade)
                  </NavDropdown.Item>
              ))}
          </div>
        </NavDropdown>
    );
};