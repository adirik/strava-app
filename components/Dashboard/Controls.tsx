import React, { useState } from "react";
import { Helmet } from "react-helmet";
import cw from "classnames";

import styles from "./Dashboard.module.css";
import { Units, useUnits } from "../../data/useUnits";
import { useUnitsContext } from "../../contexts/Units";

export const Controls: React.ComponentType = () => {
    const { units, setUnits } = useUnitsContext();

    return (
        <nav className="navbar navbar-light bg-light">
            <div className="btn-group" role="group">
                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" defaultChecked={units == Units.IMPERIAL} onClick={() => setUnits(Units.IMPERIAL)}/>
                <label className="btn btn-outline-primary" htmlFor="btnradio1">MI</label>
                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" defaultChecked={units == Units.METRIC} onClick={() => setUnits(Units.METRIC)}/>
                <label className="btn btn-outline-primary" htmlFor="btnradio2">KM</label>
            </div>
        </nav>
    );
};