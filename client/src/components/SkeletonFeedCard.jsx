import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────
   USAGE IN YOUR FEED:

   import SkeletonFeedCard, { SkeletonFeed } from "./SkeletonFeedCard";

   // Show 4 skeleton cards while loading
   {isLoading ? <SkeletonFeed count={4} /> : <YourFeedPosts posts={posts} />}

───────────────────────────────────────────── */

// ── Shimmer keyframe injected once into <head> ──────────────────────────────
const SHIMMER_CSS = `
  @keyframes cc-shimmer {
    0%   { background-position: -200% 0 }
    100% { background-position:  200% 0 }
  }
  @keyframes cc-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
`;

function injectStyles() {
    if (document.getElementById("cc-skeleton-styles")) return;
    const tag = document.createElement("style");
    tag.id = "cc-skeleton-styles";
    tag.textContent = SHIMMER_CSS;
    document.head.appendChild(tag);
}

// ── Design tokens ────────────────────────────────────────────────────────────
const tokens = {
    card: {
        background: "rgba(14,14,20,0.85)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "20px",
        padding: "20px",
        marginBottom: "0px",
        overflow: "hidden",
        animation: "cc-fade-in 0.35s ease both",
        boxShadow: "0 2px 20px rgba(0,0,0,0.15)",
    },
    shimmerBase: {
        background:
            "linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 75%)",
        backgroundSize: "200% 100%",
        animation: "cc-shimmer 1.5s ease-in-out infinite",
        borderRadius: "8px",
    },
};

// ── Primitive shimmer block ───────────────────────────────────────────────────
function Bone({ width = "100%", height = 12, style = {}, delay = 0 }) {
    return (
        <div
            style={{
                ...tokens.shimmerBase,
                width,
                height,
                animationDelay: `${delay}s`,
                flexShrink: 0,
                ...style,
            }}
        />
    );
}

// ── Single skeleton card ──────────────────────────────────────────────────────
export default function SkeletonFeedCard({
    showImage = true,
    showTag = true,
    lineCount = 2,
    animationDelay = 0,
}) {
    useEffect(() => { injectStyles(); }, []);

    return (
        <div style={{ ...tokens.card, animationDelay: `${animationDelay}s` }}>

            {/* ── Header: avatar + name + timestamp ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Bone
                    width={42} height={42}
                    style={{ borderRadius: "50%", flexShrink: 0 }}
                    delay={0}
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                    <Bone width="48%" height={13} delay={0.03} />
                    <Bone width="32%" height={10} delay={0.06} />
                </div>
                {showTag && (
                    <Bone width={52} height={24} style={{ borderRadius: "20px" }} delay={0.09} />
                )}
            </div>

            {/* ── Image placeholder ── */}
            {showImage && (
                <Bone
                    width="100%" height={190}
                    style={{ borderRadius: "12px", marginBottom: 14 }}
                    delay={0.04}
                />
            )}

            {/* ── Text lines ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {Array.from({ length: lineCount }).map((_, i) => (
                    <Bone
                        key={i}
                        width={i === lineCount - 1 ? "68%" : "100%"}
                        height={11}
                        delay={0.05 * i}
                    />
                ))}
            </div>

            {/* ── Divider ── */}
            <div
                style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.03)",
                    marginBottom: 12,
                }}
            />

            {/* ── Action buttons row ── */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Bone width={62} height={28} style={{ borderRadius: "20px" }} delay={0.07} />
                <Bone width={62} height={28} style={{ borderRadius: "20px" }} delay={0.10} />
                <Bone width={50} height={28} style={{ borderRadius: "20px" }} delay={0.13} />
                <div style={{ flex: 1 }} />
                <Bone width={28} height={28} style={{ borderRadius: "50%" }} delay={0.16} />
            </div>

        </div>
    );
}

// ── Convenience wrapper: render N skeleton cards ──────────────────────────────
export function SkeletonFeed({ count = 3 }) {
    // Alternate between cards with and without images for realistic variety
    const variants = [
        { showImage: true, lineCount: 2 },
        { showImage: false, lineCount: 3 },
        { showImage: true, lineCount: 2 },
        { showImage: false, lineCount: 4 },
    ];

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonFeedCard
                    key={i}
                    animationDelay={i * 0.07}
                    {...variants[i % variants.length]}
                />
            ))}
        </>
    );
}

