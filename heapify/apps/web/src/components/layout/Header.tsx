import { Bell, Menu } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";

export default function Header({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuthStore();
  return (
    <header className="h-16 bg-white border-b px-4 flex items-center justify-between">
      <button className="md:hidden" onClick={onMenu}><Menu /></button>
      <div className="text-sm text-slate-500">Campus Portal</div>
      <div className="flex items-center gap-4">
        <div className="relative"><Bell /><span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">3</span></div>
        <div className="text-right"><p className="text-sm font-semibold">{user?.full_name}</p><button className="text-xs text-red-600" onClick={() => logout()}>Logout</button></div>
      </div>
    </header>
  );
}

