import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * QuadrantHoverPreview - Informative hover preview for PsychMirror quadrants
 * 
 * SUCCESS CRITERIA (Non-Negotiable):
 * 
 * ✅ User instantly understands what each quadrant contains
 *    - Preview shows 3 clear, concrete items
 *    - Bullet format is scannable
 *    - Text is concise (2-5 words per item)
 * 
 * ✅ User feels guided, not overwhelmed
 *    - Maximum 3 items (cognitive load limit)
 *    - No icons, buttons, or tooltips
 *    - Simple bullet list format
 *    - Subtle animation (200ms, no bounce)
 * 
 * ✅ User still needs to click to engage
 *    - Preview is NOT clickable (pointer-events-none)
 *    - Preview disappears immediately on hover end
 *    - No action buttons or interactive elements
 *    - Hover is informational only
 * 
 * ✅ Hover feels informative, not distracting
 *    - Fade + slight upward motion (6px)
 *    - No looping animations
 *    - Stops once visible
 *    - No AI language or promises
 * 
 * ❌ If hover becomes the "main experience", it failed
 *    - Preview should not replace node interaction
 *    - Preview should not be the primary way to explore
 *    - Preview should enhance, not replace, clicking nodes
 *    - Preview is a preview, not content delivery
 * 
 * ARCHITECTURE:
 * - Single source of truth: getPreviewItemsForQuadrant()
 * - Prepared for future AI personalization (no refactor needed)
 * - Enforces all cognitive load constraints
 */
interface QuadrantHoverPreviewProps {
  type: 'goal' | 'habit' | 'trait' | 'emotion' | 'struggle' | 'interest';
  position: { x: number; y: number };
  angle: number;
}

// Quadrant titles mapping
const QUADRANT_TITLES: Record<string, string> = {
  goal: 'Goals',
  habit: 'Habits',
  trait: 'Traits',
  emotion: 'Emotions',
  struggle: 'Struggles',
  interest: 'Interests',
};

// Universal preview data - 3 items per quadrant (static MVP)
// This will be replaced by AI personalization in the future
const UNIVERSAL_PREVIEW = {
  habits: [
    "Sleep consistency",
    "Focus blocks",
    "Daily movement",
  ],
  struggles: [
    "Procrastination loops",
    "Self-doubt",
    "Overwhelm",
  ],
  emotions: [
    "Stress reactivity",
    "Frustration tolerance",
    "Motivation dips",
  ],
  goals: [
    "Priority clarity",
    "Short-term wins",
    "Long-term direction",
  ],
};

// Type for user state (prepared for future AI personalization)
// This will be populated from useUserStore or similar when AI is implemented
type UserState = any; // To be defined when AI personalization is implemented

/**
 * Gets preview items for a quadrant.
 * 
 * ARCHITECTURE: Single source of truth for preview items.
 * Currently returns static UNIVERSAL_PREVIEW data.
 * 
 * Future: This function can be swapped to call:
 *   getRecommendedFocus(quadrantId, userState)
 * 
 * No refactor required - just replace the implementation.
 * 
 * @param quadrantId - The quadrant type identifier
 * @param userState - User state (optional, prepared for future AI personalization)
 * @returns Array of preview items (max 3) for the quadrant
 */
const getPreviewItemsForQuadrant = (
  quadrantId: string,
  userState?: UserState
): string[] => {
  // CURRENT: Static universal preview (MVP)
  const mapping: Record<string, keyof typeof UNIVERSAL_PREVIEW> = {
    habit: 'habits',
    struggle: 'struggles',
    emotion: 'emotions',
    goal: 'goals',
  };
  
  const key = mapping[quadrantId];
  const items = key ? UNIVERSAL_PREVIEW[key] : [];
  
  // FUTURE: Replace above with:
  // return getRecommendedFocus(quadrantId, userState).slice(0, 3);
  
  // Enforce maximum of 3 items (non-negotiable constraint)
  return items.slice(0, 3);
};

export const QuadrantHoverPreview = ({ type, position, angle }: QuadrantHoverPreviewProps) => {
  const [hovered, setHovered] = useState(false);

  // Calculate position for the preview (offset from quadrant center)
  const previewOffset = 180;
  const previewX = position.x + Math.cos((angle * Math.PI) / 180) * previewOffset;
  const previewY = position.y + Math.sin((angle * Math.PI) / 180) * previewOffset;

  const title = QUADRANT_TITLES[type] || type;
  
  // Calculate title position (above quadrant center, closer to center)
  const titleOffset = 120;
  const titleX = position.x + Math.cos((angle * Math.PI) / 180) * titleOffset;
  const titleY = position.y + Math.sin((angle * Math.PI) / 180) * titleOffset;

  return (
    <>
      {/* Quadrant title - shrinks on hover */}
      <motion.h3
        className="absolute pointer-events-none z-30 text-lg font-bold text-white"
        style={{
          left: `${titleX - 50}px`,
          top: `${titleY - 40}px`,
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}
        animate={{ scale: hovered ? 0.94 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Invisible hover area - positioned at the category region center */}
      <motion.div
        className="absolute pointer-events-auto cursor-pointer"
        style={{
          left: `${position.x - 150}px`,
          top: `${position.y - 150}px`,
          width: '300px',
          height: '300px',
        }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      />

      {/* Preview overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0, y: 6 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.2 }}
            className="absolute pointer-events-none z-50"
            style={{
              left: `${previewX - 140}px`,
              top: `${previewY - 100}px`,
              width: '280px',
            }}
          >
            <div
              className="glass rounded-2xl p-4 border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(15,15,25,0.98) 0%, rgba(20,20,35,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              {/* Header - text only, no icons */}
              <div className="mb-3">
                <span className="text-sm font-semibold text-white">Work on →</span>
              </div>

              {/* Universal items list - simple bullet format */}
              {/* Items come from single source: getPreviewItemsForQuadrant() */}
              {/* Future: Will call getRecommendedFocus(quadrantId, userState) */}
              <div className="space-y-1.5">
                {getPreviewItemsForQuadrant(type).map((item) => (
                  <div key={item} className="text-sm text-gray-300">
                    • {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
