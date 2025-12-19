import { useAppTranslate } from "@/hooks";
import { SaveOutlined } from "@ant-design/icons";
import { Button, type ButtonProps } from "antd";

export const SaveButton = (props: ButtonProps) => {
  const { t } = useAppTranslate();
  return (
    <Button type="primary" icon={<SaveOutlined />} {...props}>
      {t("Save")}
    </Button>
  );
};
