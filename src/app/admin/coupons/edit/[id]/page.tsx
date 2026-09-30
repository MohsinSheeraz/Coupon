import EditCouponClient from "./EditCoupon";

export const dynamic = "force-dynamic"; // keep it dynamic

export default async function Page({
    params,
}: {
    // 👇  note the Promise<>
    params: Promise<{ id: string }>;
}) {
    // resolve the promise the checker expects
    const { id } = await params;
    return <EditCouponClient id={id} />;
}