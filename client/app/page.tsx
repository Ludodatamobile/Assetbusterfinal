import AdditionalSections from "@/home/AdditionalSections";
import Hero from "@/home/Hero";
import MarketplaceSections from "@/home/Marketplacesections";

export default function Home() {
  return (
    <>
      <Hero />
      <MarketplaceSections />
      <AdditionalSections />
    </>
  );
}