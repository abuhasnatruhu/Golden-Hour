declare module 'suncalc' {
  export interface SunTimes {
    sunrise: Date;
    sunriseEnd: Date;
    goldenHourEnd: Date;
    solarNoon: Date;
    goldenHour: Date;
    sunsetStart: Date;
    sunset: Date;
    dusk: Date;
    nauticalDusk: Date;
    night: Date;
    nadir: Date;
    nightEnd: Date;
    nauticalDawn: Date;
    dawn: Date;
  }

  export interface MoonTimes {
    rise?: Date;
    set?: Date;
    alwaysUp?: boolean;
    alwaysDown?: boolean;
  }

  export interface SunPosition {
    azimuth: number;
    altitude: number;
  }

  export interface MoonPosition {
    azimuth: number;
    altitude: number;
    distance: number;
    parallacticAngle: number;
  }

  export interface MoonIllumination {
    fraction: number;
    phase: number;
    angle: number;
  }

  export function getTimes(date: Date, lat: number, lng: number): SunTimes;
  export function getMoonTimes(date: Date, lat: number, lng: number): MoonTimes;
  export function getPosition(date: Date, lat: number, lng: number): SunPosition;
  export function getMoonPosition(date: Date, lat: number, lng: number): MoonPosition;
  export function getMoonIllumination(date: Date): MoonIllumination;
}