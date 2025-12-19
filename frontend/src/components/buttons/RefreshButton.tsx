import { useAppTranslate } from "@/hooks";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, type ButtonProps } from "antd";

export const RefreshButton = (props: ButtonProps) => {
  const { t } = useAppTranslate();
  return (
    <Button icon={<ReloadOutlined />} {...props}>
      {t("Refresh")}
    </Button>
  );
};
