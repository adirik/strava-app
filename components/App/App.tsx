import React from "react";
import { Link, Route, Routes } from "react-router-dom";

import { AuthState, useAuthStateContext } from "../../contexts/AuthState";
import { OAuth } from "../OAuth/OAuth";
import { Dashboard } from "../Dashboard/Dashboard";
import { QueryParamsError } from "./QueryParamError";

import { TokenExchange } from "./TokenExchange";
import { TokenRefresh } from "./TokenRefresh";

export const App: React.ComponentType = () => {
    const { authState } = useAuthStateContext();

    switch (authState) {
        case AuthState.QUERY_PARAMS_ERROR:
            return <QueryParamsError />;
        case AuthState.UN_AUTH:
            return <OAuth />;
        case AuthState.HAS_REFRESH_TOKEN:
            return <TokenRefresh />;
        case AuthState.HAS_AUTHORIZATION_CODE:
            return <TokenExchange />;
        case AuthState.VALID:
        default:
            return (
                <div>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="*" element={<NoMatch />} />
                  </Routes>
                </div>
            );
    }
};

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
