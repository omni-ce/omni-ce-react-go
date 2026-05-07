import satellite from "@/lib/satellite";
import type { AxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoReload } from "react-icons/io5";

interface CaptchaProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  length?: number;
  security?: "weak" | "medium" | "strong";
  messagePleaseEnter?: string;
  messageWrong?: string;
  onReady?: (validate: () => Promise<boolean>) => void;
}

export default function Captcha({
  value,
  onChange,
  disabled,
  length = 4,
  security = "weak",
  messagePleaseEnter,
  messageWrong,
  onReady,
}: CaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaId, setCaptchaId] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState(value || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const drawCaptcha = useCallback(
    (text: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = "#f3f4f6";
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

        // Random color for each character
        const r = Math.floor(Math.random() * 100 + 50);
        const g = Math.floor(Math.random() * 100 + 50);
        const b = Math.floor(Math.random() * 100 + 50);
        ctx.fillStyle = `rgb(${r},${g},${b})`;

        if (security === "medium" || security === "strong") {
          // Random rotation between -25 and 25 degrees
          const angle = ((Math.random() * 50 - 25) * Math.PI) / 180;
          ctx.rotate(angle);
        }

        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }

      // Strong: add 2-3 random colored lines across the text
      if (security === "strong") {
        const margin = 6;

        const strokeRandomLine = (
          x1: number,
          y1: number,
          x2: number,
          y2: number,
        ) => {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          const lr = Math.floor(Math.random() * 200 + 55);
          const lg = Math.floor(Math.random() * 200 + 55);
          const lb = Math.floor(Math.random() * 200 + 55);
          ctx.strokeStyle = `rgb(${lr},${lg},${lb})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        };

        // 1) static dari kiri atas ke kanan bawah
        strokeRandomLine(margin, margin, width - margin, height - margin);

        // 2) static hanya di kiri tengah dan kanan random
        strokeRandomLine(
          margin,
          height / 2,
          width - margin,
          margin + Math.random() * (height - margin * 2),
        );

        // 3) kiri random dan kanan static di tengah
        strokeRandomLine(
          margin,
          margin + Math.random() * (height - margin * 2),
          width - margin,
          height / 2,
        );
      }
    },
    [security],
  );

  const fetchCaptcha = useCallback(
    async (lastId?: string, opts?: { preserveError?: boolean }) => {
      setLoading(true);
      if (!opts?.preserveError) setError("");
      setUserInput("");

      // eslint-disable-next-line react-hooks/exhaustive-deps
      length = Number(length);
      const lengthValid =
        typeof length === "number" && Number.isFinite(length) && length > 0;
      const previewQuery = lengthValid ? `?length=${length}` : "";

      try {
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
        const data = response.data?.data;
        const captchaCode = data.captcha;
        console.log({ captchaCode });

        if (data) {
          setCaptchaId(data.captcha_id);
          setCaptchaText(captchaCode);
          drawCaptcha(captchaCode);
        }
      } catch {
        setError("Failed to load captcha");
      } finally {
        setLoading(false);
      }
    },
    [drawCaptcha, length],
  );

  // Initial load
  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  // Redraw when captchaText or security changes
  useEffect(() => {
    if (captchaText) {
      drawCaptcha(captchaText);
    }
  }, [captchaText, security, drawCaptcha]);

  // Expose validate function to parent
  useEffect(() => {
    if (!onReady) return;

    const validate = async (): Promise<boolean> => {
      if (!userInput.trim()) {
        setError(messagePleaseEnter || "Please enter the captcha");
        return false;
      }
      try {
        await satellite.post("/api/captcha/validate", {
          captcha_id: captchaId,
          captcha: userInput.trim(),
        });
        setError("");
        return true;
      } catch (err) {
        const error = err as AxiosError<{
          message: string;
        }>;
        const msg =
          error.response?.data?.message || "Captcha verification failed";
        setError(messageWrong || msg);
        // Auto-regenerate on failure
        fetchCaptcha(captchaId, { preserveError: true });
        return false;
      }
    };

    onReady(validate);
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
    <div>
      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          width={200}
          height={50}
          className="rounded-lg border border-gray-300 bg-gray-100"
        />
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={loading || disabled}
          className="rounded-lg border border-gray-300 p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
          title="Regenerate captcha"
        >
          <IoReload className={loading ? "animate-spin" : ""} size={20} />
        </button>
      </div>
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
        className={`mt-2 w-full rounded-lg border px-4 py-3 transition outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
