export type EvaluationFixture = {
  id: string;
  workflowId: string;
  description: string;
  input: string;
  expectedStatus: "complete" | "needs_clarification" | "invalid";
  expectedPresentFields: string[];
  expectedMissingFields: string[];
};

export const fixtures: EvaluationFixture[] = [
  {
    id: "insurance-complete",
    workflowId: "insurance_quote",
    description: "All required fields are present in explicit key:value format.",
    input: [
      "vehicleMake: Toyota",
      "vehicleModel: Corolla",
      "vehicleYear: 2022",
      "location: Belgrade",
      "driverBirthYear: 1990",
      "vin: 1HGCM82633A123456",
    ].join(", "),
    expectedStatus: "complete",
    expectedPresentFields: ["vehicleMake", "vehicleModel", "vehicleYear", "location", "driverBirthYear", "vin"],
    expectedMissingFields: [],
  },
  {
    id: "insurance-missing-vin",
    workflowId: "insurance_quote",
    description: "All fields present except VIN.",
    input: [
      "vehicleMake: Toyota",
      "vehicleModel: Corolla",
      "vehicleYear: 2022",
      "location: Belgrade",
      "driverBirthYear: 1990",
    ].join(", "),
    expectedStatus: "needs_clarification",
    expectedPresentFields: ["vehicleMake", "vehicleModel", "vehicleYear", "location", "driverBirthYear"],
    expectedMissingFields: ["vin"],
  },
  {
    id: "insurance-empty-input",
    workflowId: "insurance_quote",
    description: "No fields can be extracted from a vague one-liner.",
    input: "Need a car insurance quote please.",
    expectedStatus: "needs_clarification",
    expectedPresentFields: [],
    expectedMissingFields: ["vehicleMake", "vehicleModel", "vehicleYear", "location", "driverBirthYear", "vin"],
  },
  {
    id: "cargo-complete",
    workflowId: "cargo_record",
    description: "All required cargo fields present in explicit key:value format.",
    input: [
      "origin: Hamburg",
      "destination: Tokyo",
      "cargoType: Electronics",
      "palletCount: 12",
      "weightKg: 2400",
      "dangerousGoodsStatus: none",
    ].join(", "),
    expectedStatus: "complete",
    expectedPresentFields: ["origin", "destination", "cargoType", "palletCount", "weightKg", "dangerousGoodsStatus"],
    expectedMissingFields: [],
  },
  {
    id: "cargo-missing-weight-and-dgs",
    workflowId: "cargo_record",
    description: "Origin, destination, cargoType, and palletCount present but weight and dangerous goods status missing.",
    input: [
      "origin: Hamburg",
      "destination: Tokyo",
      "cargoType: Electronics",
      "palletCount: 12",
    ].join(", "),
    expectedStatus: "needs_clarification",
    expectedPresentFields: ["origin", "destination", "cargoType", "palletCount"],
    expectedMissingFields: ["weightKg", "dangerousGoodsStatus"],
  },
  {
    id: "invalid-workflow",
    workflowId: "unknown_workflow",
    description: "Unknown workflow ID returns invalid status.",
    input: "Some intake text.",
    expectedStatus: "invalid",
    expectedPresentFields: [],
    expectedMissingFields: [],
  },
];
