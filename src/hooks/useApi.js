"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/services/api";

/** Loads a GET endpoint and keeps its data, loading and error state. */
export function useApi(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(
    () =>
      api
        .get(url)
        .then((res) => {
          setData(res);
          setError("");
        })
        .catch((err) => setError(err.message || "Could not load data."))
        .finally(() => setIsLoading(false)),
    [url]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, isLoading, error, reload };
}

/** Runs a button's API call, tracking busy state and showing its error. */
export function useAction(onDone) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const run = useCallback(
    (action) => {
      setIsBusy(true);
      setError("");
      return Promise.resolve()
        .then(action)
        .then(() => onDone && onDone())
        .catch((err) => setError(err.message || "Something went wrong."))
        .finally(() => setIsBusy(false));
    },
    [onDone]
  );

  return { isBusy, error, run };
}
