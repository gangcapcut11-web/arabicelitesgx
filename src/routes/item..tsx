
function DownloadButton({ url, filename }: { url: string; filename: string }) {
  const [loading, setLoading] = useState(false);
  async function handle() {
    try {
      setLoading(true);
      const res = await fetch(url);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
    } catch {
      window.open(url, "_blank");
    } finally {
      setLoading(false);
    }
  }
  return (
    <button onClick={handle} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform disabled:opacity-60">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      تحميل على الجهاز
    </button>
  );
}
