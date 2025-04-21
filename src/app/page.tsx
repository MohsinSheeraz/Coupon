import { CarouselSpacing } from "@/components/Carousel";
import DiscountDeals from "@/components/Discount-Deals";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <CarouselSpacing />
      <DiscountDeals />
    </>
  );
}
