export interface Headerindex {
  numberIndex: number;
  dateIndex: number;
  geohashIndex: number;
  baseName: number;
}

export interface RowContent {
  userNumber: string;
  userTimes: string;
  userGeoHash:string;
}
export interface dataToBackend{
  header: Headerindex,
  content: upLoadContens[]
}
export interface upLoadContens{
  tableEachRow: string[]
}

export interface ViewData {
  phone: string;
  inDateTime: string;
  geohash: string;
}

export interface StayTime {
  start: string;
  end: string;
  interval: number;
}

export interface PhoneGeoHash {
  phone: string;
  geohash: string;
  inDateTime: string;
}

export interface PhoneGeoHashDateTimeCounts {
  phone: string;
  geohash: string;
  dateTimes: StayTime[];
  sumDateTimes: number;
  geoHashName: string;
  geoHashNameCount: number;
}

export interface PhoneGeoHashName {
  phone: string;
  geohash: string;
  baseName: number;
}

export interface PhoneGeoHashNameCount{
  phone: string;
  geohash: string;
  baseName: string;
  baseNameCount: number;
}

//export interface GeoHashGetNew

export const  GET_CURRENT: number = 1;
export const  GET_PREVIOS: number = 2;
