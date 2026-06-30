"use client";

import { useEffect, useRef } from "react";
import styles from "./PlacesAutocomplete.module.css";

interface PlaceResult {
  street: string;
  city: string;
  lat: number;
  lng: number;
}

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  onPlaceSelect?: (result: PlaceResult) => void;
  placeholder?: string;
}

export default function PlacesAutocomplete({ onChange, onPlaceSelect, placeholder }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceSelectRef = useRef(onPlaceSelect);

  onChangeRef.current = onChange;
  onPlaceSelectRef.current = onPlaceSelect;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const el = new google.maps.places.PlaceAutocompleteElement({
      requestedLanguage: "en",
    });

    const handlePlaceSelect = async (event: Event) => {
      const { place } = event as Event & { place: google.maps.places.Place };
      await place.fetchFields({ fields: ["addressComponents", "location"] });

      const get = (type: string) =>
        place.addressComponents?.find((c) => c.types.includes(type))?.longText ?? "";

      const street = [get("route"), get("street_number")].filter(Boolean).join(" ");
      const city = get("locality") || get("administrative_area_level_2");
      const lat = place.location?.lat() ?? 0;
      const lng = place.location?.lng() ?? 0;

      onChangeRef.current?.(street);
      onPlaceSelectRef.current?.({ street, city, lat, lng });
    };

    el.addEventListener("gmp-placeselect", handlePlaceSelect);
    container.appendChild(el);

    return () => {
      el.removeEventListener("gmp-placeselect", handlePlaceSelect);
      container.replaceChildren();
    };
  }, []);

  return <div ref={containerRef} className={styles.container} data-placeholder={placeholder} />;
}
