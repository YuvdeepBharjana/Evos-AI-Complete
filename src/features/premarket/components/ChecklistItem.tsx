import { CheckCircle2, Circle, Lock } from 'lucide-react';

export interface ChecklistItemProps {
  title: string;
  description: string;
  isCompleted: boolean;
  isDisabled: boolean;
  isLocked: boolean;
  disabledReason?: string;
  onAction: () => void;
  actionLabel: string;
}

export function ChecklistItem({
  title,
  description,
  isCompleted,
  isDisabled,
  isLocked,
  disabledReason,
  onAction,
  actionLabel,
}: ChecklistItemProps) {
  return (
    <div
      className={`
        p-6 rounded-xl border backdrop-blur-xl transition-all
        ${isCompleted 
          ? 'bg-green-500/5 border-green-400/30' 
          : 'bg-white/5 border-white/10'
        }
        ${isLocked ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-4">
        {/* ===== CHECKBOX ICON ===== */}
        <div className="flex-shrink-0 mt-1">
          {isLocked ? (
            <Lock className="w-6 h-6 text-gray-500" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : (
            <Circle className="w-6 h-6 text-gray-500" />
          )}
        </div>

        {/* ===== CONTENT ===== */}
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-1 ${isCompleted ? 'text-green-400' : 'text-white'}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {description}
          </p>

          {/* ===== ACTION BUTTON ===== */}
          {!isCompleted && !isLocked && (
            <button
              onClick={onAction}
              disabled={isDisabled}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${isDisabled
                  ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30'
                }
              `}
            >
              {actionLabel}
            </button>
          )}

          {/* ===== COMPLETED MESSAGE ===== */}
          {isCompleted && !isLocked && (
            <div className="text-sm text-green-400 font-medium">
              ✓ Completed
            </div>
          )}

          {/* ===== LOCKED MESSAGE ===== */}
          {isLocked && (
            <div className="text-sm text-gray-500 font-medium">
              🔒 Day closed
            </div>
          )}

          {/* ===== DISABLED REASON ===== */}
          {isDisabled && !isCompleted && !isLocked && disabledReason && (
            <p className="text-xs text-gray-500 mt-2 italic">
              {disabledReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
