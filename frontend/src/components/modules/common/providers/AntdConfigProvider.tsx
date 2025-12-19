import { observer } from "mobx-react-lite";
import appStore from "../../../../stores/AppStore";
import { getAntdTheme } from "../../../../utils/theme";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";

export const AntdConfigProvider = observer(
  ({ children }: { children: ReactNode }) => {
    return (
      <ConfigProvider 
        theme={getAntdTheme(appStore.state.darkMode, appStore.state.primaryColor)} 
        locale={appStore.state.localeProvider}
      >
        {children}
      </ConfigProvider>
    );
  }
);
