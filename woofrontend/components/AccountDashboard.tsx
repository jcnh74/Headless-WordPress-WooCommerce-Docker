import React from "react";

type AccountDashboardProps = {
  user: any;
  orders: any[];
  wishlist: any[];
};

const AccountDashboard: React.FC<AccountDashboardProps> = ({
  user,
  orders,
  wishlist,
}) => {
  // TODO: Implement profile, order history, address forms, wishlist
  return <div>Account dashboard UI coming soon...</div>;
};

export default AccountDashboard;
