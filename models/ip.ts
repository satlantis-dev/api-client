export type IPInfo = {
    readonly city: string;
    readonly countryCode2: string;
    readonly countryName: string;
    readonly countryFlag: string;
    readonly currency: Currency;
    readonly latitude: string;
    readonly longitude: string;
    readonly timeZone: TimeZone;
    readonly weather: Weather;
};

export type Currency = {
    readonly code: string;
    readonly name: string;
    readonly symbol: string;
};

export type TimeZone = {
    readonly name: string;
    readonly offset: number;
};

export type Weather = {
    readonly weather: null;
    readonly main: Main;
};

export type Main = {
    readonly temp: number;
    readonly pressure: number;
    readonly humidity: number;
};
