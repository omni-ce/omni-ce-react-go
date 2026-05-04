import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import Loading from "@/components/Loading";
import { auth_to_app_navigate } from "@/constant";
import ControlButton from "@/components/ControlButton";

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, validateToken } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const valid = await validateToken();
      if (valid) {
        if (
          !location.pathname.startsWith(
            "/" + auth_to_app_navigate.split("/")[1],
          )
        ) {
          navigate(auth_to_app_navigate, { replace: true });
        }
      }
    };
    checkAuth();
  }, [validateToken, navigate, location.pathname]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-dark-900 overflow-hidden">
      {/* top right */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
        <ControlButton />
      </div>

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-accent-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-100 h-100 bg-neon-cyan/8 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 w-full">
        <Outlet />
      </div>
    </div>
  );
}
