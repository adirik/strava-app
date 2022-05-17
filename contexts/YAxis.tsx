import React from "react";
import { YAxis, useYAxis } from "../data/useYAxis";

type SetYAxis = React.Dispatch<React.SetStateAction<YAxis>>;

export interface YAxisCtx {
    yAxis: YAxis;
    setYAxis: SetYAxis;
}

const defaultUpdate: SetYAxis = () => YAxis.ELAPSED_TIME;

export const YAxisContext = React.createContext<YAxisCtx>({
    yAxis: YAxis.ELAPSED_TIME,
    setYAxis: defaultUpdate,
});

export const YAxisProvider = ({ children }: { children: React.ReactNode }) => {
    const [yAxis, setYAxis] = useYAxis();

    return (
        <YAxisContext.Provider value={{ yAxis, setYAxis }}>
            {children}
        </YAxisContext.Provider>
    );
};

export const useYAxisContext = (): YAxisCtx => {
    return React.useContext(YAxisContext);
};
