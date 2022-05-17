import React, { useState } from "react";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import { StarredSegments } from "../Dashboard/StarredSegments";
import { UnitControls } from "./UnitControls";
import { YAxisControls } from "./YAxisControls";

export const Controls: React.ComponentType = () => {
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
                <YAxisControls/>
              </Navbar.Collapse>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    );
};