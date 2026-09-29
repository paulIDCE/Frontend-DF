import { Button } from "antd";
import { SuccessButton } from "@idce/kit";

const ButtonsDemo = () => {
  return (
    <div className="flex gap-4 justify-center flex-wrap">
      <Button>Normal</Button>
      <Button type="primary">Primary</Button>
      {/* colorInfo comparte valor con colorPrimary (§3), de ahi el mismo tono */}
      <Button color="primary" variant="filled">
        Info
      </Button>
      <SuccessButton>Success</SuccessButton>
      <Button color="danger" variant="solid">
        Danger
      </Button>
    </div>
  );
};

export default ButtonsDemo;
