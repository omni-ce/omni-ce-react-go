import { useEffect, useRef, useState } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Image from "@/components/Image";

interface Props {
  value?: string | Blob | null;
  onChange: (value: Blob | null | string) => void;
  disabled?: boolean;
}

export default function CameraSelector({
  value,
  onChange,
  disabled = false,
}: Props) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(
    typeof value === "string" ? value : null,
  );
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { language } = useLanguageStore();

  const loadCameraDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
        return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device: MediaDeviceInfo) => device.kind === "videoinput",
      );
      setCameraDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error loading camera devices:", error);
    }
  };

  const startCamera = async (deviceId?: string) => {
    try {
      let stream: MediaStream | null = null;

      // Try with specific device if provided
      if (deviceId) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
            audio: false,
          });
        } catch (err) {
          console.warn("Failed with exact deviceId, trying without:", err);
          // Fallback to any camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      } else {
        // First time opening, try simplest approach
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (!stream) {
        throw new Error("Failed to get camera stream");
      }

      streamRef.current = stream;
      setShowCamera(true);

      // Load camera devices after getting permission
      await loadCameraDevices();

      // Set video source after state update
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch((err: unknown) => {
            console.error("Error playing video:", err);
          });
        }
      }, 100);
    } catch (error: unknown) {
      console.error("Error accessing camera:", error);
      const err = error as Error;
      const errorMessage =
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : err.name === "NotFoundError"
            ? "No camera found on this device."
            : err.name === "OverconstrainedError"
              ? "Camera does not support the requested settings. Trying with default settings..."
              : "Unable to access camera. Please check your camera and permissions.";
      alert(errorMessage);
    }
  };

  const switchCamera = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    // Stop current camera
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
    }
    // Start new camera
    await startCamera(deviceId);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setCapturedImage(url);
            onChange(blob);
            // Stop camera after capture
            stopCamera();
          }
        }, "image/jpeg");
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    onChange(null);
    startCamera();
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {!showCamera && !capturedImage && (
        <button
          type="button"
          onClick={() => startCamera()}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-gray-600 transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {language({
            id: "Buka Kamera",
            en: "Open Camera",
          })}
        </button>
      )}

      {showCamera && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg border-2 border-gray-300">
            <video ref={videoRef} autoPlay playsInline className="w-full">
              <track kind="captions" />
            </video>
          </div>

          {/* Camera Selection Dropdown */}
          {cameraDevices.length > 1 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {language({
                  id: "Pilih Kamera",
                  en: "Select Camera",
                })}
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => switchCamera(e.target.value)}
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {cameraDevices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={captureImage}
              disabled={disabled}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {language({
                id: "Ambil Gambar",
                en: "Capture",
              })}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
            >
              {language({
                id: "Batal",
                en: "Cancel",
              })}
            </button>
          </div>
        </div>
      )}

      {capturedImage && !showCamera && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg border-2 border-gray-300">
            <Image src={capturedImage} alt="Captured" className="w-full" />
          </div>
          <button
            type="button"
            onClick={retakePhoto}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            {language({
              id: "Ambil Ulang",
              en: "Retake Photo",
            })}
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
