import React from "react";
import { FullPageCenter } from "./FullPageCenter";
import { InnerPadding } from "./InnerPadding";
import { OuterMargin } from "./OuterMargin";
import { SingleItemContainer } from "./SingleItemContainer";

export function SingleItemLayout({ children }: { children: React.ReactNode }) {
  return (
    <FullPageCenter>
      <SingleItemContainer>
        <OuterMargin>
          <InnerPadding>{children}</InnerPadding>
        </OuterMargin>
      </SingleItemContainer>
    </FullPageCenter>
  );
}
