import { Factory } from "fishery";
import type {
  DBProgram,
  Program,
} from "../data/get-programs-from-raw-programs.js";
import { getImplementationStatus } from "../data/hardcode/programs.js";

export type FactoryProgram = Program | null;

export const programFactory = Factory.define<FactoryProgram, DBProgram>(
  ({ transientParams }) => {
    if (!transientParams.id || !transientParams.name) return null;

    return {
      program_id: transientParams.id,
      name: transientParams.name,
      implementation_status: getImplementationStatus(
        transientParams.implementation_start,
        transientParams.implementation_end,
      ),
    };
  },
);
