import React, { ReactNode, JSX } from "react";
import Header from "@/_componets/Header";
import ProtectedRoutes from "@/_componets/ProtectedRoutes";

type PageProps = {
  children: ReactNode;
};

function Page({ children }: PageProps): JSX.Element {
  return (
    <ProtectedRoutes>
      <div>
        <Header />
        {children}
      </div>
    </ProtectedRoutes>
  );
}

export default Page;
