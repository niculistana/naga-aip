import { Factory } from "fishery";
import type { Item } from "../../types/index.js";

type AmountToItemParams = {
  ps: number;
  mooe: number;
  co: number;
};

export const rawAmountToItemFactory = Factory.define<
  Item,
  {},
  Item,
  AmountToItemParams
>(({ params }) => {
  return {
    name: "Amount",
    amount: {
      ps: params.ps,
      mooe: params.mooe,
      co: params.co,
    },
  };
});
