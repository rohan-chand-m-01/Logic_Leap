import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints/admin";
import toast from "react-hot-toast";

export default function AdminModerationPage() {
  const [report, setReport] = useState<any>(null);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [reason, setReason] = useState("");
  const [ack, setAck] = useState(false);

  const load = async () => {
    setReport(await adminApi.flagsReport());
    setAppeals(await adminApi.appeals());
  };

  useEffect(() => { load(); }, []);

  const deanon = async () => {
    if (!reason || !ack) return toast.error("Reason and acknowledgment required");
    const res = await adminApi.deanon({ message_id: "m1", reason });
    toast.success(`Revealed: ${res.student_identity.name}`);
  };

  return <div className="space-y-4">
    <div className="bg-white p-4 rounded"><h3 className="font-semibold">De-anonymization Audit</h3><textarea className="w-full border rounded p-2 mt-2" placeholder="Document reason" value={reason} onChange={(e) => setReason(e.target.value)} /><label className="block mt-2 text-sm"><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /> <span className="ml-1">I acknowledge this action is audited and for compliance use only.</span></label><button className="mt-2 px-3 py-2 bg-red-600 text-white rounded" onClick={deanon}>Reveal Identity</button></div>

    <div className="bg-white p-4 rounded"><h3 className="font-semibold">Flag Report</h3>{report && <><p>Total flags: {report.total_flags}</p><div className="grid md:grid-cols-3 gap-2 mt-2">{report.by_category.map((c: any) => <div key={c.category} className="border rounded p-2 text-sm">{c.category}: {c.count}</div>)}</div><div className="mt-2 space-y-1">{report.flagged_messages.map((m: any) => <div key={m.content_hash} className="border rounded p-2 text-xs">{m.content_hash} • {m.room} • {m.category} • {m.count}</div>)}</div></>}</div>

    <div className="bg-white p-4 rounded"><h3 className="font-semibold">Appeals</h3><div className="space-y-2 mt-2">{appeals.map((a) => <div key={a.id} className="border rounded p-2 text-sm"><p>{a.reason}</p><p>Status: {a.status}</p>{a.status === "pending" && <div className="flex gap-2 mt-2"><button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => adminApi.decideAppeal(a.id, "reversed", "Reversed after review").then(load)}>Reverse</button><button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => adminApi.decideAppeal(a.id, "upheld", "Violation upheld").then(load)}>Uphold</button></div>}</div>)}</div></div>
  </div>;
}
