import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "../../utils/schemas";
import { teacherApi } from "../../api/endpoints/teacher";
import toast from "react-hot-toast";

type FormData = { password: string; confirmPassword: string };

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ leave_decision: true, substitute_request: true });
  const [history] = useState([{ id: "h1", type: "covered", detail: "Covered Math CS-A on 2026-05-03" }, { id: "h2", type: "absent", detail: "Absent Physics CS-A on 2026-05-04" }]);
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(profileSchema), mode: "onChange" });

  useEffect(() => { teacherApi.profile().then(setProfile); }, []);

  const updatePassword = async () => {
    toast.success("Password updated", { duration: 3000 });
    reset();
  };

  if (!profile) return <div className="animate-pulse bg-slate-200 h-40 rounded" />;

  return <div className="space-y-4">
    <div className="bg-white rounded p-4"><h3 className="font-semibold">Personal Info</h3><p>Name: {profile.name}</p><p>Employee ID: {profile.employee_id}</p><p>Assignments: {profile.subjects.join(", ")}</p></div>

    <form onSubmit={handleSubmit(updatePassword)} className="bg-white rounded p-4 space-y-2"><h3 className="font-semibold">Change Password</h3><input type="password" className="border p-2 rounded w-full" placeholder="New password" {...register("password")} /><p className="text-red-600 text-xs">{errors.password?.message}</p><input type="password" className="border p-2 rounded w-full" placeholder="Confirm password" {...register("confirmPassword")} /><p className="text-red-600 text-xs">{errors.confirmPassword?.message}</p><button disabled={!isValid || isSubmitting} className="px-3 py-2 bg-blue text-white rounded disabled:bg-slate-400">{isSubmitting ? "Updating..." : "Update Password"}</button></form>

    <div className="bg-white rounded p-4"><h3 className="font-semibold">Notification Preferences</h3>{Object.keys(prefs).map((k) => <label key={k} className="block text-sm"><input type="checkbox" checked={prefs[k]} onChange={(e) => setPrefs((p) => ({ ...p, [k]: e.target.checked }))} /> <span className="ml-1">{k}</span></label>)}</div>

    <div className="bg-white rounded p-4"><h3 className="font-semibold">Substitute History</h3>{history.map((h) => <div key={h.id} className="border rounded p-2 mt-2 text-sm">{h.detail}</div>)}</div>
  </div>;
}
