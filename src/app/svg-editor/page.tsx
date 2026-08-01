import SVGEditorWorkspace from "@/components/editor/SVGEditorWorkspace";

export const metadata = {
  title: "SVG Workspace | Aegis Hub",
  description: "Advanced SVG editing and manipulation tool.",
};

export default function SVGEditorPage() {
  return (
    <div style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
      <SVGEditorWorkspace />
    </div>
  );
}
