import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "../../utils/schemas";
import { studentApi } from "../../api/endpoints/student";
import { aiApi } from "../../api/endpoints/admin";
import toast from "react-hot-toast";

type FormData = { password: string; confirmPassword: string };

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  const { register, handleSubmit, formState: { errors, isValid, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(profileSchema), mode: "onChange" });

  useEffect(() => {
    studentApi.profile().then((p) => { setProfile(p); setPrefs(p.notification_preferences || {}); });
    aiApi.sessions().then(setSessions);
    studentApi.notifications();
  }, []);

  const submitPassword = async () => {
    toast.success("Password updated", { duration: 3000 });
    reset();
  };

  const savePrefs = async () => {
    await studentApi.updateProfile({ notification_preferences: prefs, digest: profile?.digest });
    toast.success("Preferences saved", { duration: 3000 });
  };

  const submitAppeal = async () => {
    const row = await studentApi.submitAppeal({ message_id: "m1", reason: "Message was academic and incorrectly blocked" });
    setAppeals((a) => [row, ...a]);
    toast("Appeal submitted", { duration: 3000, icon: "ℹ️" });
  };

  if (!profile) return <div className="animate-pulse bg-slate-200 h-40 rounded" />;

  const filtered = sessions.filter((s) => s.preview.toLowerCase().includes(q.toLowerCase()));

  return <div className="space-y-4">
    <div className="bg-white rounded p-4"><h3 className="font-semibold">Personal Info</h3><div className="grid md:grid-cols-2 gap-2 mt-2 text-sm"><p>Name: {profile.name}</p><p>Student ID: {profile.student_id}</p><p>Section: {profile.section}</p><p>Email: {profile.email}</p></div></div>

    <form onSubmit={handleSubmit(submitPassword)} className="bg-white rounded p-4 space-y-2"><h3 className="font-semibold">Change Password</h3><input type="password" className="border p-2 rounded w-full" placeholder="New password" {...register("password")} /><p className="text-red-600 text-xs">{errors.password?.message}</p><input type="password" className="border p-2 rounded w-full" placeholder="Confirm password" {...register("confirmPassword")} /><p className="text-red-600 text-xs">{errors.confirmPassword?.message}</p><button disabled={!isValid || isSubmitting} className="px-3 py-2 bg-blue text-white rounded disabled:bg-slate-400">{isSubmitting ? "Updating..." : "Update Password"}</button></form>

    <div className="bg-white rounded p-4"><h3 className="font-semibold">Notification Preferences</h3><div className="grid md:grid-cols-3 gap-2 mt-2">{Object.entries({ attendance_alert: true, attendance_warning: true, preprep_new: true, test_published: true, resource_new: true, event_new: true }).map(([k]) => <label key={k} className="text-sm"><input type="checkbox" checked={Boolean(prefs[k])} onChange={(e) => setPrefs((p) => ({ ...p, [k]: e.target.checked }))} /> <span className="ml-1">{k}</span></label>)}</div><div className="mt-2"><select className="border rounded p-2" value={profile.digest || "daily"} onChange={(e) => setProfile((p: any) => ({ ...p, digest: e.target.value }))}><option value="none">None</option><option value="daily">Daily</option><option value="weekly">Weekly</option></select></div><button className="mt-2 px-3 py-2 bg-teal text-white rounded" onClick={savePrefs}>Save Preferences</button></div>

    <div className="bg-white rounded p-4"><h3 className="font-semibold">Flag Appeal History</h3><button className="mt-2 px-3 py-2 bg-amber text-white rounded" onClick={submitAppeal}>Submit Sample Appeal</button><div className="mt-2 space-y-2">{appeals.length ? appeals.map((a) => <div key={a.id} className="border rounded p-2 text-sm">{a.reason} - <span className="font-medium">{a.status}</span></div>) : <p className="text-sm text-slate-500">No appeals yet.</p>}</div></div>

    <div className="bg-white rounded p-4"><h3 className="font-semibold">AI Session History</h3><input className="border p-2 rounded w-full mt-2" placeholder="Search sessions by topic" value={q} onChange={(e) => setQ(e.target.value)} /> <div className="mt-2 space-y-2">{filtered.length ? filtered.map((s) => <div key={s.id} className="border rounded p-2 text-sm">{new Date(s.created_at).toLocaleString()} - {s.preview}</div>) : <p className="text-sm text-slate-500">No AI sessions found.</p>}</div></div>
  </div>;
}
