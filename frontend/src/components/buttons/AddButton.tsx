import { useAppTranslate } from "@/hooks";
import { PlusOutlined } from "@ant-design/icons";
import { Button, type ButtonProps } from "antd";

export const AddButton = ({ children, ...props }: ButtonProps) => {
  const { t } = useAppTranslate();
  return (
    <Button type="primary" icon={<PlusOutlined />} {...props}>
      {t(children as string)}
    </Button>
  );
};
