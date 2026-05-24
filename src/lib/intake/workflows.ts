import { z } from "zod";
import type { WorkflowDefinition } from "./types";

const insuranceQuoteSchema = z.object({
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.number().int().optional(),
  location: z.string().optional(),
  driverBirthYear: z.number().int().optional(),
  coverageStart: z.string().optional(),
  vin: z.string().optional(),
});

const cargoRecordSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  cargoType: z.string().optional(),
  palletCount: z.number().int().optional(),
  temperatureSensitive: z.boolean().optional(),
  weightKg: z.number().optional(),
  dangerousGoodsStatus: z.string().optional(),
});

export const workflows = {
  insurance_quote: {
    id: "insurance_quote",
    name: "Insurance Quote",
    description: "Extracts the data required to start an insurance premium quote request.",
    sampleInput:
      "Need quote for Toyota Corolla 2022 in Belgrade. Driver born 1990. Coverage should start next month.",
    schema: insuranceQuoteSchema,
    requiredFields: ["vehicleMake", "vehicleModel", "vehicleYear", "location", "driverBirthYear", "vin"],
    extractionGuidance: "Extract only insurance quote request details from the provided text.",
    missingFieldMessages: {
      vehicleMake: "Vehicle make is required for an automatic quote.",
      vehicleModel: "Vehicle model is required for an automatic quote.",
      vehicleYear: "Vehicle year is required for an automatic quote.",
      location: "Location is required for rating and regional rules.",
      driverBirthYear: "Driver birth year is required for rating.",
      vin: "VIN is required before the quote can be finalized.",
    },
  },
  cargo_record: {
    id: "cargo_record",
    name: "Cargo Record",
    description: "Extracts the data required to create a cargo or shipment record.",
    sampleInput:
      "Need shipment from Hamburg to Tokyo. Electronics, 12 pallets, temperature sensitive. Weight is 2400 kg.",
    schema: cargoRecordSchema,
    requiredFields: ["origin", "destination", "cargoType", "palletCount", "weightKg", "dangerousGoodsStatus"],
    extractionGuidance: "Extract only cargo shipment details from the provided text.",
    missingFieldMessages: {
      origin: "Origin is required to create a cargo record.",
      destination: "Destination is required to create a cargo record.",
      cargoType: "Cargo type is required to classify the shipment.",
      palletCount: "Pallet count is required for handling and capacity planning.",
      weightKg: "Cargo weight is required for transport planning.",
      dangerousGoodsStatus: "Dangerous goods status is required for compliance checks.",
    },
  },
} satisfies Record<string, WorkflowDefinition>;

export type WorkflowId = keyof typeof workflows;

export function getWorkflow(workflowId: string): WorkflowDefinition | undefined {
  return workflows[workflowId as WorkflowId];
}

export function listWorkflows() {
  return Object.values(workflows).map(({ id, name, description, requiredFields, sampleInput }) => ({
    id,
    name,
    description,
    requiredFields,
    sampleInput,
  }));
}
