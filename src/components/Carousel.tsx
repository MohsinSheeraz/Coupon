'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';

export default function CarouselSpacing() {
    return (
        <Carousel className="max-w-6xl mx-auto py-24">
            <CarouselContent className="-ml-1">
                {Array.from({ length: 12 }).map((_, index) => (
                    <CarouselItem
                        key={index}
                        className="pl-1 md:basis-1/2 lg:basis-1/3"
                    >
                        <Card className="shadow-md">
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                                <span className="text-3xl font-semibold text-primary">
                                    {index + 1}
                                </span>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="cursor-pointer" />
            <CarouselNext className="cursor-pointer" />
        </Carousel>
    );
}
