import EditStore from "./EditStore";

export const dynamic = "force-dynamic";

export default async function Page({
    params,
}: { params: Promise<{ id: string }> }) {
    const { id } = await params;        // resolve the promise for typed-routes
    return <EditStore id={id} />;
}
