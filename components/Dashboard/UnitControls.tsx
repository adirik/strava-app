import React, { useState } from "react";

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

import { Units } from "../../data/useUnits";
import { useUnitsContext } from "../../contexts/Units";

export const UnitControls: React.ComponentType = () => {
    const { units, setUnits } = useUnitsContext();
    const radios = [
        { name: 'MI', value: Units.IMPERIAL },
        { name: 'KM', value: Units.METRIC },
    ];

    return (
      <ButtonGroup>
        {radios.map((radio, idx) => (
            <ToggleButton
              key={idx}
              id={`radio-${idx}`}
              type="radio"
              value={radio.value}
              checked={units === radio.value}
              onChange={(e) => setUnits(e.currentTarget.value)}
            >
              {radio.name}
            </ToggleButton>
        ))}
      </ButtonGroup>
    );
};