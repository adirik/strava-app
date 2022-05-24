import React, { useState } from "react";

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Navbar from 'react-bootstrap/Navbar';

import { YearRangeSlider } from "../Slider/YearRangeSlider";
import styles from "./Dashboard.module.css";

export const YearRangeControls: React.ComponentType<{
    yearRange: any | null;
    setYearRange: (value: any) => void;
}> = ({
    yearRange,
    setYearRange
}) => {
    return (
      <div className={styles.navbarControl}>
        <Navbar.Text>
          <span className={styles.controlsLabel}>Years:</span>
        </Navbar.Text>
        <ButtonGroup>
          <YearRangeSlider yearRange={yearRange} setYearRange={setYearRange}/>
        </ButtonGroup>
      </div>
    );
};