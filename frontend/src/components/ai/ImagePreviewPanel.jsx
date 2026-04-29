import { CheckCircle2, Download, Image, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const inspirationItems = [
  {
    desc: "Modern color palette with traditional patterns",
    src: "https://images.unsplash.com/photo-1691616551175-227d6ae549ec",
    title: "Madhubani Art",
  },
  {
    desc: "Minimal silhouettes and heritage metalwork",
    src: "https://images.unsplash.com/photo-1672680833009-51d42cde2d4b",
    title: "Brass Craft",
  },
  {
    desc: "Textile-friendly motifs for everyday fashion",
    src: "https://images.unsplash.com/photo-1544031089-3ebe8bf549b0",
    title: "Block Printing",
  },
  {
    desc: "Geometric finishes on classic pottery forms",
    src: "https://images.unsplash.com/photo-1607063696672-9dbc90ef3ebf",
    title: "Pottery",
  },
];

export default function ImagePreviewPanel({
  activeTab,
  generatedDesign,
  isGenerating,
  onDownload,
  onSelect,
  onRetry,
  onTabChange,
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b px-6 py-3">
        <div className="grid w-full grid-cols-2 rounded-lg bg-muted p-1">
          {["preview", "examples"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`rounded-md px-4 py-2 text-sm transition-colors ${
                activeTab === tab
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {tab === "preview" ? "Design Preview" : "Examples"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "preview" ? (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          {isGenerating ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <h3 className="mb-2 text-lg font-medium">Generating your design...</h3>
              <p className="text-sm text-muted-foreground">
                AI Artisan is rendering a product-ready concept for your prompt.
              </p>
            </div>
          ) : generatedDesign ? (
            <div className="w-full text-center">
              <div className="mb-4 overflow-hidden rounded-lg border shadow-sm">
                <img
                  alt="AI-generated artisan design"
                  className="h-auto w-full"
                  src={generatedDesign.imageUrl}
                />
              </div>
              <p className="mb-4 mt-2 text-sm italic text-muted-foreground">
                "{generatedDesign.description}"
              </p>
              <div className="flex justify-center gap-2">
                <Button size="sm" onClick={onSelect}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Select this design
                </Button>
                <Button variant="outline" size="sm" onClick={onDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={onRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Image className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">No design generated yet</h3>
              <p className="text-sm text-muted-foreground">
                Describe a craft idea and generate a polished concept image here.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {inspirationItems.map((item) => (
            <div key={item.title} className="overflow-hidden rounded-lg border">
              <img alt={item.desc} className="h-40 w-full object-cover" src={item.src} />
              <div className="p-3">
                <h4 className="text-sm font-medium">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
