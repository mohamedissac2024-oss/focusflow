import Button from "./Button";
export default function Modal({ title, children, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#12121C] border border-[#2A2A3D] rounded-xl p-6 w-[90%] max-w-md">
        <h2 className="text-white text-xl font-bold mb-4">{title}</h2>
        {children}
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          {onSave && <Button onClick={onSave}>Save</Button>}
        </div>
      </div>
    </div>
  );
}