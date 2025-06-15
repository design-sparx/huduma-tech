"use client";

import { useEffect, useRef } from "react";

export function useRenderTracker(componentName: string, props?: any) {
  const renderCount = useRef(0);
  const prevProps = useRef(props);

  renderCount.current += 1;

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);

      if (props && prevProps.current) {
        const changedProps = Object.keys(props).filter(
          key => props[key] !== prevProps.current[key]
        );

        if (changedProps.length > 0) {
          console.log(
            `📝 ${componentName} props changed:`,
            changedProps.map(key => ({
              key,
              from: prevProps.current[key],
              to: props[key],
            }))
          );
        }
      }

      prevProps.current = props;
    }
  });

  return renderCount.current;
}
