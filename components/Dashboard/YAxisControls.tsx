import React, { useState } from "react";
//import cw from "classnames";

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Navbar from 'react-bootstrap/Navbar';
import ToggleButton from 'react-bootstrap/ToggleButton';

import { YAxis } from "../../data/useYAxis";
import { useYAxisContext } from "../../contexts/YAxis";
import styles from "./Dashboard.module.css";

export const YAxisControls: React.ComponentType = () => {
    const { yAxis, setYAxis } = useYAxisContext();
    const radios = [
        { name: 'Time', value: YAxis.ELAPSED_TIME },
        { name: 'Power', value: YAxis.AVG_WATTS },
    ];

    return (
      <div>
        <Navbar.Text>
          <span className={styles.controlsLabel}>Y Axis:</span>
        </Navbar.Text>
        <ButtonGroup>
          {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-yaxis-${idx}`}
                type="radio"
                value={radio.value}
                checked={yAxis === radio.value}
                onChange={(e) => setYAxis(e.currentTarget.value)}
              >
                {radio.name}
              </ToggleButton>
          ))}
        </ButtonGroup>
      </div>
    );
};