"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const StatefulButton = forwardRef(function StatefulButton(
    {
        idleLabel,
        loadingLabel,
        successLabel,
        errorLabel,
        icon,
        action,
        tone = "teal",
        className = "",
    },
    ref,
) {
    const [state, setState] = useState("idle");
    const requestIdRef = useRef(0);

    async function run(forcedOutcome) {
        if (state === "loading") return; // spam-click guard
        const requestId = ++requestIdRef.current;
        setState("loading");
        try {
            await action(forcedOutcome);
            if (requestIdRef.current !== requestId) return; // a newer click won the race
            setState("success");
            setTimeout(() => {
                if (requestIdRef.current === requestId) setState("idle");
            }, 1400);
        } catch {
            if (requestIdRef.current !== requestId) return;
            setState("error");
        }
    }

    useImperativeHandle(ref, () => ({ run }));

    const isLoading = state === "loading";
    const isError = state === "error";
    const isSuccess = state === "success";

    const toneClasses = isError
        ? "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
        : isSuccess
            ? "bg-teal-dark text-white"
            : tone === "mustard"
                ? "bg-mustard text-ink hover:bg-mustard/90 focus-visible:ring-mustard active:scale-[0.97]"
                : "bg-teal text-white hover:bg-teal-dark focus-visible:ring-teal active:scale-[0.97]";

    return (
        <button
            type="button"
            onClick={() => run()}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-live="polite"
            className={`relative grid h-11 w-48 shrink-0 place-items-center rounded-lg text-sm font-medium  transition-[background-color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${toneClasses} ${isError ? "animate-btn-shake" : ""
                } ${className}`}
        >
            <Layer active={state === "idle"} exitDirection="up">
                {icon}
                {idleLabel}
            </Layer>

            <Layer active={isLoading} exitDirection="down">
                <Spinner />
                {loadingLabel}
            </Layer>

            <Layer active={isSuccess} exitDirection="pop">
                <CheckIcon />
                {successLabel}
            </Layer>

            <Layer active={isError} exitDirection="down">
                <ErrorIcon />
                {errorLabel}
            </Layer>
        </button>
    );
});

export default StatefulButton;

function Layer({ active, exitDirection, children }) {
    const hiddenTransform =
        exitDirection === "pop"
            ? "scale-75"
            : exitDirection === "up"
                ? "-translate-y-1.5"
                : "translate-y-1.5";

    const easing =
        exitDirection === "pop" ? "ease-[cubic-bezier(0.34,1.56,0.64,1)]" : "ease-out";

    return (
        <span
            className={`[grid-area:1/1] flex items-center gap-2 transition-all duration-200 ${easing} ${active
                    ? "scale-100 opacity-100"
                    : `pointer-events-none opacity-0 ${hiddenTransform}`
                }`}
        >
            {children}
        </span>
    );
}

function Spinner() {
    return (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
                className="opacity-90"
                d="M4 12a8 8 0 0 1 8-8"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 12l5 5L20 6" />
        </svg>
    );
}

function ErrorIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 9v4m0 4h.01M10.29 3.86 2.11 18.04A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
    );
}