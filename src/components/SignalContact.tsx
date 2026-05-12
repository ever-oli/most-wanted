import { MessageCircle, ExternalLink } from "lucide-react";

/**
 * Standing back-channel block. Direct Signal contact, no product context.
 * Lives in the Footer area as the always-on operator line.
 */
export const SignalContact = () => (
  <div className="w-full max-w-sm mx-auto md:mx-0 bg-background/80 backdrop-blur border border-border rounded-lg p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-full bg-[#3A76F0]/15 flex items-center justify-center">
        <MessageCircle className="h-4 w-4 text-[#3A76F0]" />
      </div>
      <div>
        <p className="font-stamp text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Back-channel · Signal
        </p>
        <p className="font-outlaw text-base text-foreground">ever.07</p>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <img
        src="/images/signal-qr.png"
        alt="Signal QR — open a secure chat"
        className="w-24 h-24 rounded border border-border/60"
        draggable={false}
      />
      <div className="flex flex-col gap-2 text-left">
        <p className="font-stamp text-[10px] text-muted-foreground leading-relaxed">
          Scan to open a secure chat. No phone number needed.
        </p>
        <a
          href="https://signal.me/#eu/ever.07"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-stamp text-[11px] text-[#3A76F0] hover:underline"
        >
          Open Signal
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  </div>
);
