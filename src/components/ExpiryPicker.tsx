import React, { useState, useEffect } from "react";
import {
  Clock, Calendar, Infinity as InfinityIcon, AlertTriangle, X, Check, Sparkles
} from "lucide-react";

export interface ExpiryPickerProps {
  value: string; // "YYYY-MM-DDTHH:mm" or ""
  onChange: (value: string) => void;
  id?: string;
  isExpired?: boolean;
}

export const dateToLocalDatetimeString = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
};

export const getNowLocalDatetime = (): string => {
  return dateToLocalDatetimeString(new Date());
};

export const getPresetDateString = (preset: string): string => {
  const now = new Date();
  switch (preset) {
    case "1h":
      now.setHours(now.getHours() + 1);
      break;
    case "24h":
      now.setDate(now.getDate() + 1);
      break;
    case "7d":
      now.setDate(now.getDate() + 7);
      break;
    case "30d":
      now.setDate(now.getDate() + 30);
      break;
    case "90d":
      now.setDate(now.getDate() + 90);
      break;
    case "endOfDay":
      now.setHours(23, 59, 0, 0);
      break;
    case "tomorrowEnd":
      now.setDate(now.getDate() + 1);
      now.setHours(23, 59, 0, 0);
      break;
    default:
      return "";
  }
  return dateToLocalDatetimeString(now);
};

const detectActivePreset = (val: string): string => {
  if (!val) return "never";
  const target = new Date(val).getTime();
  if (isNaN(target)) return "custom";
  const now = Date.now();
  const diffHours = (target - now) / (1000 * 60 * 60);

  if (diffHours >= 0.8 && diffHours <= 1.2) return "1h";
  if (diffHours >= 23 && diffHours <= 25) return "24h";
  if (diffHours >= 165 && diffHours <= 172) return "7d";
  if (diffHours >= 690 && diffHours <= 730) return "30d";

  return "custom";
};

export const formatExpiryReadable = (val: string): { label: string; isPast: boolean } => {
  if (!val) {
    return { label: "No expiration — link stays active indefinitely", isPast: false };
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    return { label: "Invalid date format", isPast: false };
  }
  const diffMs = d.getTime() - Date.now();
  const isPast = diffMs < -60000; // 1 min grace

  const timeFormatted = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const dateFormatted = d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  const absDiff = Math.abs(diffMs);
  const diffMins = Math.round(absDiff / (1000 * 60));
  const diffHours = Math.round(absDiff / (1000 * 60 * 60));
  const diffDays = Math.round(absDiff / (1000 * 60 * 60 * 24));

  let relative = "";
  if (diffMins < 60) {
    relative = `${diffMins} min${diffMins === 1 ? "" : "s"}`;
  } else if (diffHours < 24) {
    relative = `${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  } else {
    relative = `${diffDays} day${diffDays === 1 ? "" : "s"}`;
  }

  if (isPast) {
    return {
      label: `Expired ${relative} ago on ${dateFormatted} at ${timeFormatted}`,
      isPast: true,
    };
  }

  return {
    label: `Expires in ${relative} (${dateFormatted} at ${timeFormatted})`,
    isPast: false,
  };
};

export const ExpiryPicker: React.FC<ExpiryPickerProps> = ({
  value,
  onChange,
  id = "expiry-input",
  isExpired = false,
}) => {
  const activePreset = detectActivePreset(value);
  const [showCustom, setShowCustom] = useState<boolean>(activePreset === "custom");

  useEffect(() => {
    if (activePreset === "custom") {
      setShowCustom(true);
    }
  }, [activePreset]);

  const handlePresetClick = (preset: string) => {
    if (preset === "never") {
      onChange("");
      setShowCustom(false);
      return;
    }
    if (preset === "custom") {
      setShowCustom(true);
      if (!value) {
        // Default custom to 24h from now so input isn't empty or invalid
        onChange(getPresetDateString("24h"));
      }
      return;
    }
    onChange(getPresetDateString(preset));
    setShowCustom(false);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!rawVal) {
      onChange("");
      return;
    }
    
    // Check if the user selected a date whose time defaults to 00:00 and is in the past today
    const parsed = new Date(rawVal);
    if (!isNaN(parsed.getTime())) {
      const now = new Date();
      // If same calendar day and time is midnight 00:00 (which is in the past for today)
      if (
        parsed.getFullYear() === now.getFullYear() &&
        parsed.getMonth() === now.getMonth() &&
        parsed.getDate() === now.getDate() &&
        parsed.getHours() === 0 &&
        parsed.getMinutes() === 0 &&
        now.getHours() > 0
      ) {
        // Smart adjust to end of day 23:59 so user's selection doesn't fail
        parsed.setHours(23, 59, 0, 0);
        onChange(dateToLocalDatetimeString(parsed));
        return;
      }
    }

    onChange(rawVal);
  };

  const preview = formatExpiryReadable(value);

  const presets = [
    { key: "never", label: "Never", icon: InfinityIcon },
    { key: "1h", label: "1 Hour" },
    { key: "24h", label: "24 Hours" },
    { key: "7d", label: "7 Days" },
    { key: "30d", label: "30 Days" },
    { key: "custom", label: "Custom..." },
  ];

  return (
    <div className="space-y-3">
      {/* Expired renewal banner */}
      {isExpired && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>This link is currently expired. Choose an extension:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handlePresetClick("24h")}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-500 transition cursor-pointer"
            >
              +24 Hours
            </button>
            <button
              type="button"
              onClick={() => handlePresetClick("7d")}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-500 transition cursor-pointer"
            >
              +7 Days
            </button>
            <button
              type="button"
              onClick={() => handlePresetClick("30d")}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-500 transition cursor-pointer"
            >
              +30 Days
            </button>
            <button
              type="button"
              onClick={() => handlePresetClick("never")}
              className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Preset Pill Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        {presets.map((p) => {
          const isSelected = p.key === "custom" ? showCustom : activePreset === p.key && !showCustom;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => handlePresetClick(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-xs scale-102"
                  : "bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {p.icon && <p.icon className="w-3 h-3" />}
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom datetime input section */}
      {showCustom && (
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-white/10 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              Select specific date & time
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange(getPresetDateString("endOfDay"))}
                className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Today 11:59 PM
              </button>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              <button
                type="button"
                onClick={() => onChange(getPresetDateString("tomorrowEnd"))}
                className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Tomorrow 11:59 PM
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="datetime-local"
              id={id}
              value={value}
              min={getNowLocalDatetime()}
              onChange={handleCustomInputChange}
              className="w-full px-3.5 py-2 glass-input text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none font-medium"
            />
          </div>
        </div>
      )}

      {/* Human-readable status indicator */}
      <div className={`flex items-center justify-between text-xs px-3 py-2 rounded-xl transition-colors ${
        preview.isPast
          ? "bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 font-medium"
          : value
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-medium"
          : "bg-zinc-100/70 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400"
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          {preview.isPast ? (
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          ) : value ? (
            <Clock className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <InfinityIcon className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          )}
          <span className="truncate">{preview.label}</span>
        </div>

        {value && (
          <button
            type="button"
            onClick={() => handlePresetClick("never")}
            className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 shrink-0 ml-2 hover:underline cursor-pointer flex items-center gap-0.5"
            title="Clear expiration date"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
