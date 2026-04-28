import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Square, TIERS, OPERATORS } from "@/lib/drop-config";
import { Package, Sparkles, X, MapPin } from "lucide-react";

interface Props {
  square: Square | null;
  onClose: () => void;
  onConfirm: (sq: Square) => void;
  alreadyInCart: boolean;
}

/** Deterministic operator assignment based on square index */
function getOperator(squareIndex: number) {
  return OPERATORS[squareIndex % OPERATORS.length];
}

export const CheckoutSheet = ({ square, onClose, onConfirm, alreadyInCart }: Props) => {
  const open = !!square;
  const tier = square ? TIERS[square.tier] : null;
  const operator = square ? getOperator(square.index) : null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-card border-t border-primary/50 text-foreground rounded-t-lg p-0 max-h-[80vh]"
      >
        {square && tier && (
          <div className="relative">
            <div className={`absolute inset-x-0 top-0 h-1 ${tier.id === "EXO" ? "bg-tier-exo" : "bg-tier-aaa"}`} />
            <div className="p-6 pt-8">
              <SheetHeader className="text-left mb-5">
                <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan">— Square #{square.index + 1} —</p>
                <SheetTitle className="font-outlaw text-3xl text-foreground flex items-center gap-2">
                  Tier: <span className={tier.id === "EXO" ? "text-tier-exo" : "text-tier-aaa"}>{tier.label}</span>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground font-stamp uppercase text-xs tracking-wider">Price</span>
                  <span className="font-outlaw text-2xl text-foreground">${tier.price}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground font-stamp uppercase text-xs tracking-wider flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" /> Contents
                  </span>
                  <span className="font-stamp text-foreground">{tier.weight} Mystery Cultivar</span>
                </div>
                {operator && (
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground font-stamp uppercase text-xs tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Hunted By
                    </span>
                    <span className="font-stamp text-foreground">{operator.alias} · {operator.region}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 py-2 text-xs text-muted-foreground italic">
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>1 of 3 variants. Sealed until it hits your door.</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (alreadyInCart) {
                    onClose();
                    return;
                  }
                  onConfirm(square);
                  // Trigger Shopify Buy Button here
                }}
                className="w-full py-4 bg-primary hover:bg-primary-glow text-primary-foreground font-outlaw text-lg uppercase tracking-widest shadow-[var(--shadow-outlaw)] transition-smooth"
              >
                {alreadyInCart ? "Already Locked In" : "Lock It In"}
              </button>
              <button
                onClick={onClose}
                className="mt-2 w-full py-2 text-muted-foreground hover:text-foreground font-stamp uppercase text-xs tracking-widest flex items-center justify-center gap-1"
              >
                <X className="h-3 w-3" /> Cancel
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
