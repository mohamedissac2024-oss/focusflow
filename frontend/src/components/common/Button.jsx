export default function Button({ children, onClick, variant = "primary", type = "button", disabled }) {
  const styles = {
    primary: "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white",
    secondary: "bg-[#1A1A28] border border-[#2A2A3D] text-[#22D3EE]",
    danger: "bg-[#EF4444] text-white",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition ${styles[variant]} ${disabled ? "opacity-50" : ""}`}>
      {children}
    </button>
  );
}