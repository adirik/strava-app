import React from "react";
import cw from "classnames";

import { SizeClass, useHorizontalSizeClass } from "../../utils/useSizeClass";

import styles from "./OAuth.module.css";
import typography from "../../styles/Typography.module.css";

function redirectToStrava() {
    const url = new URL("https://www.strava.com/oauth/authorize");
    url.searchParams.set("client_id", "78406");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("approval_prompt", "auto");
    url.searchParams.set("scope", "read");
    url.searchParams.set("redirect_uri", window.location.href);

    window.location.href = url.toString();
}

export const OAuth: React.ComponentType = () => {
    const sizeClass = useHorizontalSizeClass();

    return (
        <div className={styles.oauthContainer}>
            <div
                className={
                    sizeClass === SizeClass.COMPACT
                        ? styles.compact
                        : styles.regular
                }
            >
                <h2 className={cw(styles.oauthTitle, typography.titleReduced)}>
                    Sign In with Strava to view this route and its segments.
                </h2>
                <button
                    className={styles.redirectButton}
                    onClick={redirectToStrava}
                >
                    <span>Sign In</span>
                </button>
                <p className={cw(styles.oauthDescription, typography.caption)}>
                    We do not need any of your private data. Connecting with
                    Strava is the only way to show route information.
                </p>
            </div>
        </div>
    );
};
