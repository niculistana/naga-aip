import React from "react";
import { FullPageCenter } from "./FullPageCenter";
import { InnerPadding } from "./InnerPadding";
import { OuterMargin } from "./OuterMargin";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollableContainer } from "./ScrollableContainer";

export function HeaderBodyFooterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FullPageCenter>
      <div className="grid grid-cols-1 min-h-screen h-full grid-flow-row grid-rows-[auto_1fr_auto] gap-y-4 w-full">
        <Header></Header>
        <div className="flex flex-col h-full">
          <ScrollableContainer>
            <OuterMargin>
              <InnerPadding>{children}</InnerPadding>
            </OuterMargin>
          </ScrollableContainer>
        </div>
        <Footer></Footer>
      </div>
    </FullPageCenter>
  );
}
