export default function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-[#9CA3AF] text-sm mb-1">{label}</label>}
      <input {...props}
        className="w-full bg-[#1A1A28] border border-[#2A2A3D] text-white px-3 py-2 rounded-lg outline-none focus:border-[#8B5CF6]" />
    </div>
  );
}