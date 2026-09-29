import { Button } from "antd";
import { SimpleAlert, ConfirmDialog, showToast } from "@idce/kit";
import { ToastContainer, toast } from "react-toastify";

const AlertsDemo = () => {
  const openSweetAlert = () => {
    SimpleAlert("success", "Éxito", "Mensaje de prueba.");
  };
  const openToast = () => {
    toast("Mensaje Toast");
  };
  const openConfirm = async () => {
    const confirmed = await ConfirmDialog({ text: "¿Desea continuar con esta acción?" });
    if (confirmed) SimpleAlert("success", "Confirmado", "Acción confirmada.");
  };
  return (
    <div className="flex flex-col gap-4">
      <Button type="primary" onClick={openSweetAlert}>
        SweetAlert Simple
      </Button>
      <Button type="primary" onClick={openConfirm}>
        ConfirmDialog
      </Button>
      <Button type="primary" onClick={openToast}>
        Toastify
      </Button>
      <Button type="primary" onClick={() => showToast.success("Éxito!")}>
        showToast.success
      </Button>
      <Button type="primary" onClick={() => showToast.error("Error!")}>
        showToast.error
      </Button>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default AlertsDemo;
