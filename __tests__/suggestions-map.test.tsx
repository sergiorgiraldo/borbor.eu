/**
 * @jest-environment jest-environment-jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock react-leaflet — jsdom has no canvas/leaflet DOM
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  useMap: () => ({ setView: jest.fn(), fitBounds: jest.fn() }),
}));

jest.mock("leaflet", () => ({
  icon: jest.fn(() => ({})),
  divIcon: jest.fn(() => ({})),
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: jest.fn(),
    },
  },
}));

import SuggestionsMap from "../app/where-to-go/SuggestionsMap";

type Suggestion = { city: string; country: string; lat?: number; lng?: number };

const suggestions: Suggestion[] = [
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { city: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
];

describe("SuggestionsMap", () => {
  it("renders map container", () => {
    render(<SuggestionsMap suggestions={suggestions} selected={null} />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("renders a marker for each suggestion with coordinates", () => {
    render(<SuggestionsMap suggestions={suggestions} selected={null} />);
    const markers = screen.getAllByTestId("marker");
    expect(markers).toHaveLength(3);
  });

  it("skips suggestions without coordinates", () => {
    const mixed: Suggestion[] = [
      { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
      { city: "Unknown", country: "????" },
    ];
    render(<SuggestionsMap suggestions={mixed} selected={null} />);
    const markers = screen.getAllByTestId("marker");
    expect(markers).toHaveLength(1);
  });

  it("renders popup with city name inside each marker", () => {
    render(<SuggestionsMap suggestions={suggestions} selected={null} />);
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
  });
});
