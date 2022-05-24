import React, { useState } from "react";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { StarredSegments } from "../Dashboard/StarredSegments";
import { UnitControls } from "./UnitControls";
import { YAxisControls } from "./YAxisControls";
import { YearRangeControls } from "./YearRangeControls";
import styles from "./Dashboard.module.css";

export const Controls: React.ComponentType<{
    yearRange: any | null;
    setYearRange: (value: any) => void;
}> = ({
    yearRange,
    setYearRange
}) => {
    const [currentSegment, setCurrentSegment] = useState<any>(null);

    return (
        <div>
            <Navbar bg="dark" variant="dark" expand="lg">
              <Container>
                <Navbar.Brand href="#home">
                    <span>S<sup>3</sup>A</span>
                    <span className={styles.navbarBrand}>&nbsp;(Strava Starred Segment Analyzer)</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Navbar.Collapse className="justify-content-end">
                        <YearRangeControls yearRange={yearRange} setYearRange={setYearRange}/>
                        <UnitControls/>
                        <YAxisControls/>
                    </Navbar.Collapse>
                </Navbar.Collapse>
              </Container>
            </Navbar>
            <Navbar bg="light" expand="lg">
              <Container>
                  <Nav className="me-auto">
                    <StarredSegments currentSegment={currentSegment} setCurrentSegment={setCurrentSegment}/>
                  </Nav>
              </Container>
            </Navbar>
        </div>
    );
};