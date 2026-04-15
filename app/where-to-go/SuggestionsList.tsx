"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";

type Suggestion = { city: string; country: string; lat?: number; lng?: number };

type Props = {
  continent?: string;
  tripType?: string;
  destination?: string;
};

const SuggestionsMap = dynamic(() => import("./SuggestionsMap"), { ssr: false });

export default function SuggestionsList({ continent, tripType, destination }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [seen, setSeen] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(
    async (exclude: string[], signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ continent, tripType, destination, exclude }),
          signal,
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          return;
        }
        const newSuggestions: Suggestion[] = data.suggestions ?? [];
        setSuggestions(newSuggestions);
        setSeen((prev) => [...prev, ...newSuggestions.map((s) => s.city)]);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [continent, tripType, destination]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchSuggestions([], controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMore() {
    fetchSuggestions(seen);
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-blue-900 bg-green-50 border border-green-200 rounded">
        {error}
      </div>
    );
  }

  if (isLoading && suggestions.length === 0) {
    return (
      <div className="p-4 text-sm text-blue-900">
        <span className="animate-pulse">Finding destinations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-blue-900">Pick destination:</p>
      <div className="space-y-2">
        {suggestions.map((s) => {
          const id = `${s.city}-${s.country}`;
          const isSelected = selected === id;
          return (
            <label
              key={id}
              className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-blue-200 bg-white hover:bg-green-50"
              }`}
            >
              <input
                type="radio"
                name="destination"
                value={id}
                checked={isSelected}
                onChange={() => setSelected(id)}
                className="accent-blue-600"
              />
              <div>
                <span className="text-sm font-medium text-blue-900">{s.city}</span>
                <span className="text-sm text-blue-600 ml-1">{s.country}</span>
              </div>
            </label>
          );
        })}
      </div>
      <button
        onClick={handleMore}
        disabled={isLoading}
        className="text-sm px-4 py-2 border border-blue-300 rounded text-blue-700 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Loading..." : "More suggestions"}
      </button>
      {suggestions.length > 0 && (
        <SuggestionsMap suggestions={suggestions} selected={selected} />
      )}
    </div>
  );
}
