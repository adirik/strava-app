import React, { useState } from "react";
import cw from "classnames";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import styles from "./Dashboard.module.css";
import { Units } from "../../data/useUnits";
import { useUnitsContext } from "../../contexts/Units";

import { StarredSegments } from "../Dashboard/StarredSegments";
import { UnitControls } from "./UnitControls";

export const Controls: React.ComponentType = () => {
    const { units, setUnits } = useUnitsContext();
    const [currentSegment, setCurrentSegment] = useState<any>(null);

    return (
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand href="#home">S<sup>3</sup>A</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <StarredSegments currentSegment={currentSegment} setCurrentSegment={setCurrentSegment}/>
              </Nav>
              <Navbar.Collapse className="justify-content-end">
                <UnitControls/>
              </Navbar.Collapse>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    );
};