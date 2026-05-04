import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/auth.store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuthStore();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const role = useAuthStore.getState().user?.role;
      if (role === "student") navigate("/student/dashboard");
      else if (role === "teacher") navigate("/teacher/dashboard");
      else navigate("/admin/dashboard");
    } catch {
      toast.error("Login failed");
    } finally { setLoading(false); }
  };

  if (user) return null;

  return <div className="min-h-screen bg-navy flex items-center justify-center p-4"><form onSubmit={submit} className="w-full max-w-md bg-white rounded-xl p-6 space-y-4"><h1 className="text-2xl font-semibold">Login</h1><input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /><input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /><button disabled={loading} className="w-full bg-blue text-white rounded py-2">{loading ? "Signing in..." : "Sign In"}</button></form></div>;
}

