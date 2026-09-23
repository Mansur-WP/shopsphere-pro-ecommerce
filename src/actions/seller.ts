/**
 * Compatibility bridge: Re-exports from @/actions/staff.
 * Maintains backwards compatibility for any legacy references.
 * NOTE: Do NOT add "use server" here — re-export modules cannot be Server Action boundaries.
 * The "use server" directive lives in @/actions/staff where the functions are defined.
 */
export {
  getStaffDashboardStats as getSellerDashboardStats,
  getStaffProducts as getSellerProducts,
  createStaffProduct as createSellerProduct,
  updateStaffProduct as updateSellerProduct,
  deleteStaffProduct as deleteSellerProduct,
  getStaffOrders as getSellerOrders,
  updateStaffStore as updateStore,
  getStaffAnalytics as getSellerAnalytics,
  getStaffProduct as getSellerProduct,
  getStaffRecentOrders as getSellerRecentOrders,
  updateStaffOrderStatus as updateSellerOrderStatus,
  getStaffAccess as getSellerAccess,
} from "@/actions/staff";
