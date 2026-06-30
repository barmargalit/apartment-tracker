export const flags = {
  googleMaps: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ENABLED === "true",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
};
