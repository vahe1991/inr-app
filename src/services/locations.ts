import $axios from "@/libs/axios";
import type { LocationType } from "@/types/location-type";

export const locationsApi = {
  async fetchLocationsList() {
    return await $axios.get<LocationType>("locations");
  },
};
