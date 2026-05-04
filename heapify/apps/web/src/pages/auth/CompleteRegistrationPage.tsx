import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";

function decode(token: string) {
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
}

export default function CompleteRegistrationPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const payload = useMemo(() => decode(token), [token]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setMessage("Passwords do not match.");
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) return setMessage("Password must be 8+ chars, one uppercase and one number.");
    await api.post("/api/v1/auth/complete-registration", { token, password });
    setMessage("Registration complete! Redirecting to login...");
    setTimeout(() => navigate("/login"), 2000);
  };

  return <div className="min-h-screen bg-surface flex items-center justify-center p-4"><form onSubmit={submit} className="w-full max-w-md bg-white rounded-xl p-6 space-y-3"><h1 className="text-2xl font-semibold">Complete Registration</h1><p>Name: <b>{payload?.full_name || "-"}</b></p><p>Role: <b>{payload?.role || "-"}</b></p><input type="password" placeholder="New Password" className="w-full border rounded px-3 py-2" value={password} onChange={(e)=>setPassword(e.target.value)} required /><input type="password" placeholder="Confirm Password" className="w-full border rounded px-3 py-2" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required /><button className="w-full bg-teal text-white rounded py-2">Complete Registration</button>{message && <p className="text-sm text-slate-700">{message}</p>}</form></div>;
}

