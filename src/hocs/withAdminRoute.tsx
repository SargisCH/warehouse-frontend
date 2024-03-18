import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { Role } from "types";

const withAdminRoute = (WrappedComponent: any) => {
  return (props: any) => {
    const user = useSelector((state: RootState) => state.user);
    if (user.role !== Role.ADMIN) {
      return <p>Forbidden</p>;
    }
    return <WrappedComponent {...props} />;
  };
};

export default withAdminRoute;
