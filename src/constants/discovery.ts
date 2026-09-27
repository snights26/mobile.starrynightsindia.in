import type { Category } from "@/src/types/api";

export type WorldTimeZone = {
  timeZone: string;
  zoneLabel: string;
  regionName: string;
  categoryCodes: string[];
};

export const WORLD_TIME_ZONES: WorldTimeZone[] = [
  { timeZone: "Asia/Kolkata", zoneLabel: "India Standard Time", regionName: "Kolkata", categoryCodes: ["REGION-CENTRAL", "REGION-SOUTH", "REGION-NORTHEAST", "REGION-WEST", "REGION-EAST", "REGION-NORTH", "REGION-ASIA"] },
  { timeZone: "Europe/London", zoneLabel: "Greenwich Mean Time", regionName: "London", categoryCodes: ["REGION-EUROPE", "REGION-AFRICA"] },
  { timeZone: "America/New_York", zoneLabel: "Eastern Time", regionName: "New York", categoryCodes: ["REGION-NORTH-AMERICA", "REGION-SOUTH-AMERICA"] },
  { timeZone: "America/Los_Angeles", zoneLabel: "Pacific Time", regionName: "Los Angeles", categoryCodes: ["REGION-NORTH-AMERICA"] },
  { timeZone: "Asia/Tokyo", zoneLabel: "Japan Standard Time", regionName: "Tokyo", categoryCodes: ["REGION-ASIA", "REGION-ISLANDS", "REGION-OCEANIA", "REGION-ANTARCTICA"] },
];

export const flattenCategories = (items: Category[] = []): Category[] => items.flatMap((item) => [item, ...flattenCategories(item.children ?? [])]);

export const formatWorldTime = (timeZone: string, date: Date): string => {
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
};
