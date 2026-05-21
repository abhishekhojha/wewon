"use client";

import { useEffect, useMemo } from "react";
import { selectIsAuthenticated, selectUser } from "@/store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserOrders } from "@/store/order/orderThunk";
import {
  selectOrderLoading,
  selectUserOrders,
  selectUserOrdersLoaded,
} from "@/store/order/orderSlice";
import {
  resolveMentorshipToolPrefill,
  ResolveMentorshipToolPrefillParams,
} from "@/utils/mentorshipOrderPrefill";

export const useMentorshipToolPrefill = (
  params: ResolveMentorshipToolPrefillParams,
) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const userOrders = useAppSelector(selectUserOrders);
  const orderLoading = useAppSelector(selectOrderLoading);
  const userOrdersLoaded = useAppSelector(selectUserOrdersLoaded);
  const isCounsellor = user?.userId?.role === "counsellor";

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isCounsellor) return;
    if (!params.productId && !params.productSlug) return;
    if (userOrdersLoaded || orderLoading) return;

    dispatch(fetchUserOrders());
  }, [
    dispatch,
    isAuthenticated,
    isCounsellor,
    orderLoading,
    params.productId,
    params.productSlug,
    userOrdersLoaded,
  ]);

  const resolvedPrefill = useMemo(() => {
    if (!isAuthenticated) return null;
    if (isCounsellor) return null;
    if (!params.productId && !params.productSlug) return null;
    return resolveMentorshipToolPrefill(userOrders, params);
  }, [
    isAuthenticated,
    isCounsellor,
    params.productId,
    params.productSlug,
    userOrders,
  ]);

  return {
    prefill: resolvedPrefill?.prefill,
    crlRankLocked: Boolean(resolvedPrefill?.crlRankLocked),
    categoryRankLocked: Boolean(resolvedPrefill?.categoryRankLocked),
    lockMessage: resolvedPrefill?.lockMessage,
    sourceOrderId: resolvedPrefill?.sourceOrderId,
    choiceFillingLocked: Boolean(resolvedPrefill?.choiceFillingLocked),
  };
};
