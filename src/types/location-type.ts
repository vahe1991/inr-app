export interface LocationType {
  data: {
    id: number;
    name: string;
    regions: Region[];
  }[];
}

export interface Region {
  id: number;
  name: string;
  cities: City[];
}

export interface City {
  id: number;
  name: string;
}
