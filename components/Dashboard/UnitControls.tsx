import React, { useState } from "react";

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Navbar from 'react-bootstrap/Navbar';
import ToggleButton from 'react-bootstrap/ToggleButton';

import { Units } from "../../data/useUnits";
import { useUnitsContext } from "../../contexts/Units";
import styles from "./Dashboard.module.css";

export const UnitControls: React.ComponentType = () => {
    const { units, setUnits } = useUnitsContext();
    const radios = [
        { name: 'MI', value: Units.IMPERIAL },
        { name: 'KM', value: Units.METRIC },
    ];

    return (
      <div>
        <Navbar.Text>
          <span className={styles.controlsLabel}>Units:</span>
        </Navbar.Text>
        <ButtonGroup>
          {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-units-${idx}`}
                type="radio"
                value={radio.value}
                checked={units === radio.value}
                onChange={(e) => setUnits(e.currentTarget.value as Units)}
              >
                {radio.name}
              </ToggleButton>
          ))}
        </ButtonGroup>
      </div>
    );
};