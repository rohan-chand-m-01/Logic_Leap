import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { timetableConfigSchema } from "../../utils/schemas";
import { z } from "zod";
import { adminApi } from "../../api/endpoints/admin";
import { EmptyState, ErrorState, SkeletonCard } from "../../components/shared/States";
import toast from "react-hot-toast";

type FormType = z.infer<typeof timetableConfigSchema>;

const defaultInput = {
  institution_id: "inst_1",
  academic_year: "2026-27",
  working_days: [1, 2, 3, 4, 5],
  working_hours: { start: "08:00", end: "17:00" },
  period_duration_minutes: 60,
  locked_slots: [{ day: 1, period: 4, label: "Lunch" }],
  teacher_assignments: [
    { teacher_id: "teach1", teacher_name: "Dr. Arjun", weekly_hours: 24, subject_preferences: ["math", "physics"] },
    { teacher_id: "teach2", teacher_name: "Prof. Mira", weekly_hours: 22, subject_preferences: ["physics"] },
  ],
  section_subject_requirements: [
    { section_id: "sec_a", section_name: "CS-A", required_subjects: [{ subject_id: "math", subject_name: "Math", periods_per_week: 5, preferred_teacher_id: "teach1" }, { subject_id: "physics", subject_name: "Physics", periods_per_week: 4 }] },
    { section_id: "sec_b", section_name: "CS-B", required_subjects: [{ subject_id: "math", subject_name: "Math", periods_per_week: 5 }] },
  ],
  rooms: [{ id: "r1", name: "A-101", capacity: 70 }, { id: "r2", name: "B-201", capacity: 60 }],
};

export default function TimetableGeneratorPage() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue } = useForm<FormType>({
    mode: "onChange",
    resolver: zodResolver(timetableConfigSchema),
    defaultValues: { academic_year: "2026-27", working_days: [1,2,3,4,5], start: "08:00", end: "17:00", period_duration_minutes: 60 },
  });

  const onGenerate = async (values: FormType) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...defaultInput,
        academic_year: values.academic_year,
        working_days: values.working_days,
        working_hours: { start: values.start, end: values.end },
        period_duration_minutes: values.period_duration_minutes,
      };
      const data = await adminApi.generateTimetable(payload);
      setDraft(data);
      toast.success("Timetable draft generated", { duration: 3000 });
    } catch (e: any) {
      setError(e?.message || "Failed to generate timetable");
      toast.error("Failed to generate timetable", { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const publish = async () => {
    if (!draft?.id) return;
    await adminApi.publishDraftTimetable(draft.id);
    toast.success("Timetable published", { duration: 3000 });
  };

  const days = watch("working_days");
  const toggleDay = (d: number) => setValue("working_days", days.includes(d) ? days.filter((x) => x !== d) : [...days, d]);

  return <div className="space-y-4">
    <div className="flex gap-2">{[1,2,3,4].map((s) => <button key={s} className={`px-3 py-2 rounded ${step===s?"bg-blue text-white":"bg-white"}`} onClick={() => setStep(s)}>Step {s}</button>)}</div>

    <form onSubmit={handleSubmit(onGenerate)} className="bg-white rounded p-4 space-y-3">
      {step === 1 && <>
        <input aria-label="Academic year" className="border rounded p-2 w-full" placeholder="Academic Year" {...register("academic_year")} />
        {errors.academic_year && <p className="text-red-600 text-xs">{errors.academic_year.message}</p>}
        <div className="flex gap-2">{[[1,"Mon"],[2,"Tue"],[3,"Wed"],[4,"Thu"],[5,"Fri"],[6,"Sat"]].map(([d,label]) => <button type="button" aria-label={`day-${label}`} key={String(d)} className={`px-3 py-1 rounded ${days.includes(Number(d))?"bg-teal text-white":"bg-slate-200"}`} onClick={() => toggleDay(Number(d))}>{String(label)}</button>)}</div>
        <div className="grid md:grid-cols-3 gap-2"><input aria-label="start" type="time" className="border rounded p-2" {...register("start")} /><input aria-label="end" type="time" className="border rounded p-2" {...register("end")} /><select aria-label="duration" className="border rounded p-2" {...register("period_duration_minutes", { valueAsNumber: true })}><option value={45}>45</option><option value={60}>60</option><option value={75}>75</option><option value={90}>90</option></select></div>
      </>}

      {step === 2 && <div className="space-y-2"><h3 className="font-semibold">Teacher Assignments</h3>{defaultInput.teacher_assignments.map((t) => <div key={t.teacher_id} className="grid md:grid-cols-3 gap-2"><input className="border p-2 rounded" defaultValue={t.teacher_name} /><input className="border p-2 rounded" type="number" defaultValue={t.weekly_hours} /><input className="border p-2 rounded" defaultValue={t.subject_preferences.join(", ")} /></div>)}<button type="button" className="px-2 py-1 bg-slate-200 rounded">Add Row</button></div>}

      {step === 3 && <div className="space-y-2"><h3 className="font-semibold">Section Requirements</h3>{defaultInput.section_subject_requirements.map((s) => <details key={s.section_id} className="border rounded p-2"><summary>{s.section_name}</summary><div className="space-y-2 mt-2">{s.required_subjects.map((r, i) => <div key={i} className="grid md:grid-cols-3 gap-2"><input className="border p-2 rounded" defaultValue={r.subject_name} /><input className="border p-2 rounded" type="number" defaultValue={r.periods_per_week} /><input className="border p-2 rounded" defaultValue={r.preferred_teacher_id || ""} placeholder="Preferred teacher" /></div>)}</div></details>)}</div>}

      {step === 4 && <div className="space-y-2"><h3 className="font-semibold">Generate</h3><p className="text-sm text-slate-600">Review input summary and solve constraints.</p><button type="submit" disabled={!isValid || loading} className="px-3 py-2 bg-blue text-white rounded disabled:bg-slate-400">{loading ? "Solving constraints..." : "Generate Timetable"}</button></div>}

      <div className="flex justify-between"><button type="button" className="px-3 py-1 bg-slate-200 rounded" onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</button><button type="button" className="px-3 py-1 bg-slate-200 rounded" onClick={() => setStep((s) => Math.min(4, s + 1))}>Next</button></div>
    </form>

    {loading && <SkeletonCard />}
    {error && <ErrorState message={error} onRetry={() => handleSubmit(onGenerate)()} />}

    {draft && <div className="bg-white rounded p-4 space-y-3">
      <h3 className="font-semibold">Draft Timetable</h3>
      <div className="bg-amber-50 border border-amber-200 p-3 rounded"><p className="font-medium text-amber-800">Conflicts</p><ul className="list-disc pl-5 text-sm">{draft.conflicts.length ? draft.conflicts.map((c: string, i: number) => <li key={i}>{c}</li>) : <li>No conflicts</li>}</ul></div>
      <div className="overflow-auto"><table className="w-full text-xs"><thead><tr><th>Section</th><th>Day</th><th>Period</th><th>Subject</th><th>Teacher</th><th>Room</th></tr></thead><tbody>{draft.timetable.map((s: any, i: number) => <tr key={i} className="border-t"><td>{s.section_id}</td><td>{s.day}</td><td>{s.period}</td><td><span className="px-2 py-1 rounded bg-blue-100 text-blue-700">{s.subject_id}</span></td><td>{s.teacher_id}</td><td>{s.room_id}</td></tr>)}</tbody></table></div>
      <div className="flex gap-2"><button className="px-3 py-2 bg-teal text-white rounded" onClick={publish}>Publish Timetable</button><button className="px-3 py-2 bg-slate-900 text-white rounded">Accept & Save</button></div>
    </div>}

    {!loading && !draft && !error && <EmptyState message="No generated timetable yet." cta={<button className="px-3 py-2 bg-blue text-white rounded" onClick={() => setStep(4)}>Start generation</button>} />}
  </div>;
}
