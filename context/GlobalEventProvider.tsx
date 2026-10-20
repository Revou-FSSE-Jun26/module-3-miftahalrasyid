"use client";

import React, { RefObject, useCallback, useEffect, useRef } from 'react'

function GlobalEventProvider({ children }: { children: React.ReactNode }) {
    const handleGlobalClick = useCallback((event: MouseEvent) => {
        const customEvent = new CustomEvent("globalClickOutside", {
            detail: {
                target: event.target
            }
        });
        window.dispatchEvent(customEvent);
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleGlobalClick)
        return () => document.removeEventListener("mousedown", handleGlobalClick)
    }, [handleGlobalClick])

    return (
        <>{children}</>
    )
}

export function useClickOutside(
    componentRef: RefObject<HTMLElement | null>,
    callback: () => void
) {
    const savedCallback = useRef(callback);
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
        const handleBroadcastReceived = (event: Event) => {
            const customEvent = event as CustomEvent<{ target: HTMLElement }>;
            const clickedElement = customEvent.detail?.target;

            if (componentRef.current && clickedElement && !componentRef.current.contains(clickedElement)) {
                savedCallback.current();
            }
        }
        window.addEventListener('globalClickOutside', handleBroadcastReceived)
        return () => window.removeEventListener('globalClickOutside', handleBroadcastReceived)
    }, [componentRef])
}

export default GlobalEventProvider