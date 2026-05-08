import satellite from "@/lib/satellite";
import type { AxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoReload } from "react-icons/io5";
import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/utils";
import * as encryption from "@/lib/encryption";
import { GeneralEnigmaSchema } from "@/enigma/general.enigma";

export type CaptchaSecurity = "low" | "medium" | "strong";
interface CaptchaProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  length?: number;
  security?: CaptchaSecurity;
  onReady?: (validateFn: () => Promise<boolean>) => void;
  messagePleaseEnter?: string;
  messageWrong?: string;
}

export default function CaptchaInput({
  value,
  onChange,
  disabled = false,
  length = 4,
  security = "low",
  onReady,
  messagePleaseEnter = "Please enter verification code",
  messageWrong = "Verification code is incorrect",
}: CaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaId, setCaptchaId] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState(value || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useThemeStore();

  const drawCaptcha = useCallback(
    (text: string) => {
      if (!text) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Background - match dashboard colors
      ctx.fillStyle = isDarkMode ? "#0a0a0f" : "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Character spacing
      const charWidth = width / (text.length + 1);
      const fontSize = Math.min(28, height * 0.5);

      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textBaseline = "middle";

      for (let i = 0; i < text.length; i++) {
        const x = charWidth * (i + 0.5);
        const y = height / 2;

        ctx.save();
        ctx.translate(x, y);

        // Random color for each character - brighter for dark mode, darker for light mode
        const minColor = isDarkMode ? 130 : 20;
        const colorRange = 100;
        const r = Math.floor(Math.random() * colorRange + minColor);
        const g = Math.floor(Math.random() * colorRange + minColor);
        const b = Math.floor(Math.random() * colorRange + minColor);
        ctx.fillStyle = `rgb(${r},${g},${b})`;

        if (security === "medium" || security === "strong") {
          const angle = ((Math.random() * 40 - 20) * Math.PI) / 180;
          ctx.rotate(angle);
        }

        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }

      if (security === "strong") {
        const margin = 6;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * margin, Math.random() * height);
          ctx.lineTo(width - Math.random() * margin, Math.random() * height);
          const minL = isDarkMode ? 80 : 40;
          const lr = Math.floor(Math.random() * 120 + minL);
          const lg = Math.floor(Math.random() * 120 + minL);
          const lb = Math.floor(Math.random() * 120 + minL);
          ctx.strokeStyle = `rgb(${lr},${lg},${lb})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    },
    [security, isDarkMode],
  );

  const fetchCaptcha = useCallback(
    async (lastId?: string, opts?: { preserveError?: boolean }) => {
      setLoading(true);
      if (!opts?.preserveError) setError("");
      setUserInput("");

      try {
        const lengthNum = Number(length);
        const lengthValid =
          typeof lengthNum === "number" &&
          Number.isFinite(lengthNum) &&
          lengthNum > 0;
        const previewQuery = lengthValid ? `?length=${lengthNum}` : "";

        let response;
        if (lastId) {
          response = await satellite.post(
            `/api/captcha/regenerate${previewQuery}`,
            {
              last_captcha_id: lastId,
            },
          );
        } else {
          response = await satellite.get(
            `/api/captcha/generate${previewQuery}`,
          );
        }
        if (response.status !== 200) {
          throw new Error(
            response.data?.message || "Failed to generate captcha",
          );
        }
        const data = response.data?.data;

        const captchaCode = data.captcha;
        const decrypted = encryption.decode(
          GeneralEnigmaSchema(window.location.origin),
          captchaCode,
        );
        if (data) {
          setCaptchaId(data.captcha_id);
          setCaptchaText(decrypted);
          drawCaptcha(decrypted);
        }
      } catch {
        setError("Failed to load captcha");
      } finally {
        setLoading(false);
      }
    },
    [length, drawCaptcha],
  );

  // Redraw when theme changes
  useEffect(() => {
    if (captchaText) {
      drawCaptcha(captchaText);
    }
  }, [isDarkMode, captchaText, drawCaptcha]);

  useEffect(() => {
    fetchCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (onReady) {
      const validate = async () => {
        if (!userInput) {
          setError(messagePleaseEnter);
          return false;
        }

        try {
          const response = await satellite.post("/captcha/validate", {
            captcha_id: captchaId,
            captcha: userInput,
          });

          if (response.status === 204) {
            setError("");
            return true;
          }
          return false;
        } catch (err: unknown) {
          const error = err as AxiosError<{
            message: string;
          }>;
          const msg =
            error.response?.data?.message || "Captcha verification failed";
          setError(messageWrong || msg);
          fetchCaptcha(captchaId, { preserveError: true });
          return false;
        }
      };

      onReady(validate);
    }
  }, [
    onReady,
    userInput,
    captchaId,
    fetchCaptcha,
    messagePleaseEnter,
    messageWrong,
  ]);

  const handleRegenerate = () => {
    fetchCaptcha(captchaId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative overflow-hidden rounded-xl border border-dark-500/80 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={200}
            height={50}
            className="block h-12.5 w-50"
          />
        </div>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={loading || disabled}
          className="flex h-12.5 w-12.5 items-center justify-center rounded-xl border border-dark-500/80 bg-dark-900/60 text-dark-300 transition-all hover:bg-dark-800 hover:text-foreground focus:ring-1 focus:ring-accent-500/30 disabled:opacity-50 shadow-xl"
          title="Regenerate captcha"
        >
          <IoReload className={loading ? "animate-spin" : ""} size={20} />
        </button>
      </div>
      <div className="relative">
        <input
          type="text"
          value={value !== undefined ? value : userInput}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value.toUpperCase();
            setUserInput(val);
            if (onChange) onChange(val);
            setError("");
          }}
          placeholder="Enter captcha"
          className={cn(
            "w-full rounded-xl border px-4 py-3.5 text-sm transition-all outline-none focus:ring-1 disabled:opacity-50",
            error
              ? "border-red-500/50 bg-red-500/5 focus:ring-red-500/30"
              : "border-dark-500/80 bg-dark-900/60 text-foreground focus:border-accent-500/60 focus:ring-accent-500/30 hover:bg-dark-800 placeholder:text-dark-400",
          )}
        />
        {error && (
          <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
