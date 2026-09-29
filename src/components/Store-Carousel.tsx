import * as React from "react";
import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { getPopularStores } from "@/lib/data";
import { Tag, BadgePercent } from "lucide-react";

export default async function CarouselSize() {
    const popularStores = await getPopularStores();

    return (
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            className="w-full"
        >
            <CarouselContent>
                {popularStores.map((store) => (
                    <CarouselItem
                        key={store.id}
                        className="w-full md:basis-1/2 lg:basis-1/3"
                    >
                        <div className="p-3">
                            <Link href={`/stores/${store.slug}`} className="group block h-full">
                                <div className="relative h-[300px] overflow-hidden rounded-3xl bg-white shadow-[0_1px_0_rgb(23_19_46/0.04),0_10px_24px_-14px_rgb(23_19_46/0.25)] ring-1 ring-ink/5 transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_40px_-18px_rgb(91_61_245/0.4)] group-hover:ring-grape/25">
                                    {/* Backdrop tinted by the store's own logo */}
                                    <div className="absolute inset-x-0 top-0 h-36 overflow-hidden">
                                        <div
                                            aria-hidden
                                            className="absolute inset-0 scale-150 bg-cover bg-center opacity-50 blur-2xl transition-transform duration-700 ease-out group-hover:scale-[1.8]"
                                            style={{ backgroundImage: `url("${store.logo || "/placeholder.svg"}")` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
                                    </div>

                                    <div className="relative flex h-full flex-col items-center px-6 pb-6 pt-9 text-center">
                                        {/* Logo */}
                                        <div className="grid size-28 place-items-center rounded-3xl bg-white shadow-[0_12px_28px_-12px_rgb(23_19_46/0.35)] ring-1 ring-ink/5 transition-transform duration-500 ease-out group-hover:-rotate-3 group-hover:scale-105">
                                            <img
                                                src={store.logo || "/placeholder.svg"}
                                                alt={store.name}
                                                className="h-16 w-16 object-contain"
                                            />
                                        </div>

                                        {/* Store Name */}
                                        <h3 className="mt-5 font-display text-xl font-semibold text-ink transition-colors duration-300 group-hover:text-grape">
                                            {store.name}
                                        </h3>

                                        {/* Coupon + Deal Info */}
                                        <div className="mt-auto flex flex-wrap justify-center gap-2 text-sm">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-grape/10 px-3 py-1 font-medium text-grape">
                                                <Tag className="h-3.5 w-3.5" />
                                                {store.couponCount} {store.couponCount === 1 ? "Coupon" : "Coupons"}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-citrus/40 px-3 py-1 font-medium text-ink">
                                                <BadgePercent className="h-3.5 w-3.5" />
                                                {store.dealCount} {store.dealCount === 1 ? "Deal" : "Deals"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </CarouselItem>

                ))}
            </CarouselContent>
            <CarouselPrevious className="cursor-pointer border-0 bg-white text-ink shadow-md hover:bg-grape hover:text-white" />
            <CarouselNext className="cursor-pointer border-0 bg-white text-ink shadow-md hover:bg-grape hover:text-white" />
        </Carousel>
    );
}
