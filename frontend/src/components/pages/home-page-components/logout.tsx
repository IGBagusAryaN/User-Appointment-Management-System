type ConfirmLogoutModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmLogoutModal = ({
  onConfirm,
  onCancel,
}: ConfirmLogoutModalProps) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/75 z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white p-6 rounded shadow-lg w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
        <p className="mb-6">Are you sure you want to log out?</p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
