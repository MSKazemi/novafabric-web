"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { MORE_GROUPS, PRIMARY_LINKS, type SiteLink } from "@/lib/site-nav";

const PAGES: SiteLink[] = [
  { label: "lab", href: "/" },
  { label: "novafabric", href: "/novafabric" },
  ...PRIMARY_LINKS.filter((l) => l.href !== "/novafabric"),
  ...MORE_GROUPS.flatMap((g) => g.links),
];

const PRIMITIVES = [
  { label: "asset registry", href: "/primitives#asset-registry" },
  { label: "run capsule", href: "/primitives#run-capsule" },
  { label: "replay engine", href: "/primitives#replay-engine" },
  { label: "lineage graph", href: "/primitives#lineage-graph" },
  { label: "novaseal", href: "/primitives#novaseal" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const router = useRouter();

  const handleOpen = useCallback(() => setOpen(true), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("nova:palette-open", handleOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("nova:palette-open", handleOpen);
    };
  }, [handleOpen]);

  function navigate(href: string, astro?: boolean) {
    setOpen(false);
    // Astro-served pages are not Next routes: a real page load, not client routing.
    if (astro) window.location.assign(href);
    else router.push(href);
  }

  function copyInstall() {
    navigator.clipboard.writeText("pip install novafabric").then(() => {
      setOpen(false);
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    });
  }

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        aria-describedby={undefined}
        style={
          {
            "--backdrop": "rgba(7,7,10,0.85)",
          } as React.CSSProperties
        }
      >
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-edge-2)",
            borderRadius: "8px",
            width: "min(520px, 90vw)",
            overflow: "hidden",
          }}
        >
          <Dialog.Title
            style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              padding: 0,
              margin: "-1px",
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          >
            Command Palette
          </Dialog.Title>
          <CommandInput
            placeholder="Search pages, primitives, actions..."
            style={{
              fontFamily: "var(--font-code), monospace",
              fontSize: "13px",
              width: "100%",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "var(--color-ink)",
              padding: "14px 16px",
              display: "block",
            }}
          />
          <div style={{ borderBottom: "1px solid var(--color-edge)" }} />
          <CommandList>
            <CommandEmpty
              style={{
                fontFamily: "var(--font-code), monospace",
                fontSize: "13px",
                color: "var(--color-muted)",
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              No results found.
            </CommandEmpty>

            <CommandGroup
              heading="Pages"
              style={
                {
                  "--heading-color": "var(--color-faint)",
                } as React.CSSProperties
              }
            >
              {PAGES.map((page) => (
                <CommandItem
                  key={page.href}
                  value={page.label}
                  onSelect={() => navigate(page.href, page.astro)}
                  style={{
                    fontFamily: "var(--font-code), monospace",
                    fontSize: "13px",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    color: "var(--color-muted)",
                  }}
                >
                  <span style={{ color: "var(--color-faint)", fontSize: "11px", minWidth: "12px" }}>/</span>
                  {page.label}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Primitives">
              {PRIMITIVES.map((prim) => (
                <CommandItem
                  key={prim.href}
                  value={prim.label}
                  onSelect={() => navigate(prim.href)}
                  style={{
                    fontFamily: "var(--font-code), monospace",
                    fontSize: "13px",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    color: "var(--color-muted)",
                  }}
                >
                  <span style={{ color: "var(--color-faint)", fontSize: "11px", minWidth: "12px" }}>#</span>
                  {prim.label}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Actions">
              <CommandItem
                value="open github"
                onSelect={() => {
                  setOpen(false);
                  window.open("https://github.com/MSKazemi/novafabric", "_blank", "noopener,noreferrer");
                }}
                style={{
                  fontFamily: "var(--font-code), monospace",
                  fontSize: "13px",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  color: "var(--color-muted)",
                }}
              >
                <span style={{ color: "var(--color-faint)", fontSize: "11px", minWidth: "12px" }}>↗</span>
                open github
              </CommandItem>
              <CommandItem
                value="copy install"
                onSelect={copyInstall}
                style={{
                  fontFamily: "var(--font-code), monospace",
                  fontSize: "13px",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  color: "var(--color-muted)",
                }}
              >
                <span style={{ color: "var(--color-faint)", fontSize: "11px", minWidth: "12px" }}>$</span>
                copy install
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </div>
      </CommandDialog>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 200,
            fontFamily: "var(--font-code), monospace",
            fontSize: "12px",
            color: "var(--color-ink)",
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-edge-2)",
            borderRadius: "6px",
            padding: "8px 14px",
            letterSpacing: "0.04em",
          }}
        >
          copied to clipboard
        </div>
      )}

      <style>{`
        [cmdk-overlay] {
          position: fixed !important;
          inset: 0 !important;
          z-index: 149 !important;
          background: rgba(7,7,10,0.85) !important;
        }
        [cmdk-dialog] {
          position: fixed !important;
          inset: 0 !important;
          z-index: 150 !important;
          display: flex !important;
          align-items: flex-start !important;
          justify-content: center !important;
          padding-top: 80px !important;
        }
        [cmdk-group-heading] {
          font-family: var(--font-code), monospace !important;
          font-size: 11px !important;
          color: var(--color-faint) !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
          padding: 8px 16px 4px !important;
        }
        [cmdk-item][aria-selected="true"] {
          background-color: var(--color-surface-2) !important;
          color: var(--color-ink) !important;
        }
        [cmdk-item][aria-selected="true"] span {
          color: var(--color-muted) !important;
        }
        [cmdk-list] {
          max-height: 340px;
          overflow-y: auto;
        }
        [cmdk-input]::placeholder {
          color: var(--color-faint) !important;
        }
      `}</style>
    </>
  );
}
