import { useEffect, useRef, useState } from 'react'

interface Props {
  value?: string | Blob | null
  onChange: (value: Blob | null) => void
  placeholder?: string
}

export default function CameraSelector({
  value,
  onChange,
  placeholder = 'Open Camera',
}: Props) {
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(
    typeof value === 'string' ? value : null
  )
  // @ts-ignore
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const loadCameraDevices = async () => {
    try {
      // @ts-ignore
      const devices = await navigator.mediaDevices.enumerateDevices()
      // @ts-ignore
      const videoDevices = devices.filter(
        (device: any) => device.kind === 'videoinput'
      )
      setCameraDevices(videoDevices)
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId)
      }
    } catch (error) {
      console.error('Error loading camera devices:', error)
    }
  }

  const startCamera = async (deviceId?: string) => {
    try {
      let stream: MediaStream | null = null

      // Try with specific device if provided
      if (deviceId) {
        try {
          // @ts-ignore
          stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
            audio: false,
          })
        } catch (err) {
          console.warn('Failed with exact deviceId, trying without:', err)
          // Fallback to any camera
          // @ts-ignore
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })
        }
      } else {
        // First time opening, try simplest approach
        // @ts-ignore
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
      }

      if (!stream) {
        throw new Error('Failed to get camera stream')
      }

      streamRef.current = stream
      setShowCamera(true)

      // Load camera devices after getting permission
      await loadCameraDevices()

      // Set video source after state update
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          // @ts-ignore
          videoRef.current.srcObject = streamRef.current
          // @ts-ignore
          videoRef.current.play().catch((err: any) => {
            console.error('Error playing video:', err)
          })
        }
      }, 100)
    } catch (error: any) {
      console.error('Error accessing camera:', error)
      const errorMessage =
        error.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : error.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : error.name === 'OverconstrainedError'
              ? 'Camera does not support the requested settings. Trying with default settings...'
              : 'Unable to access camera. Please check your camera and permissions.'
      alert(errorMessage)
    }
  }

  const switchCamera = async (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    // Stop current camera
    if (streamRef.current) {
      // @ts-ignore
      streamRef.current.getTracks().forEach((track: any) => track.stop())
    }
    // Start new camera
    await startCamera(deviceId)
  }

  const stopCamera = () => {
    if (streamRef.current) {
      // @ts-ignore
      streamRef.current.getTracks().forEach((track: any) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      // @ts-ignore
      videoRef.current.srcObject = null
    }
    setShowCamera(false)
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      // @ts-ignore
      canvas.width = video.videoWidth
      // @ts-ignore
      canvas.height = video.videoHeight
      // @ts-ignore
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // @ts-ignore
        ctx.drawImage(video, 0, 0)
        // @ts-ignore
        canvas.toBlob((blob: Blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            setCapturedImage(url)
            onChange(blob)
            // Stop camera after capture
            stopCamera()
          }
        }, 'image/jpeg')
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    onChange(null)
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        // @ts-ignore
        streamRef.current.getTracks().forEach((track: any) => track.stop())
      }
    }
  }, [])

  return (
    <div className="space-y-3">
      {!showCamera && !capturedImage && (
        <button
          type="button"
          onClick={() => startCamera()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-gray-600 transition hover:border-blue-500 hover:text-blue-600"
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
          {placeholder}
        </button>
      )}

      {showCamera && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg border-2 border-gray-300">
            <video ref={videoRef} autoPlay playsInline className="w-full" />
          </div>

          {/* Camera Selection Dropdown */}
          {cameraDevices.length > 1 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Camera
              </label>
              <select
                value={selectedDeviceId}
                // @ts-ignore
                onChange={(e) => switchCamera(e.target.value)}
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
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              Capture
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {capturedImage && !showCamera && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg border-2 border-gray-300">
            <img src={capturedImage} alt="Captured" className="w-full" />
          </div>
          <button
            type="button"
            onClick={retakePhoto}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
          >
            Retake Photo
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
