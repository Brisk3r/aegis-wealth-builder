import SVGConverter from "@/components/converter/SVGConverter";

export const metadata = {
  title: "SVG Converter & Optimizer | Aegis Hub",
  description: "Convert SVG to PNG, WEBP, JPEG, React JSX, Vue SFC, or Data URI. Optimize and clean SVG XML code instantly.",
};

export default function SVGConverterPage() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 0" }}>
      <SVGConverter />
    </div>
  );
}
