import SVGGenerators from "@/components/generators/SVGGenerators";

export const metadata = {
  title: "SVG Wave & Pattern Generators | Aegis Hub",
  description: "Generate customizable SVG waves, section dividers, and seamless background patterns for modern web applications.",
};

export default function SVGGeneratorsPage() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 0" }}>
      <SVGGenerators />
    </div>
  );
}
