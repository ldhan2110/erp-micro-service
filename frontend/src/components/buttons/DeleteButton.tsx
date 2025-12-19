import { useAppTranslate } from "@/hooks";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, type ButtonProps } from "antd";

export const DeleteButton = ({ children, ...props }: ButtonProps) => {
  const { t } = useAppTranslate();
  return (
    <Button icon={<DeleteOutlined />} danger {...props}>
      {t(children as string)}
    </Button>
  );
};
