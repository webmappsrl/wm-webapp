export interface ILocation {
  longitude: number;
  latitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  bearing?: number;
  timestamp: number;
  getLatLng(): [number, number];
}

export interface IGeolocationServiceState {
  isLoading: boolean;
  isActive: boolean;
  isRecording: boolean;
  isPaused: boolean;
}
