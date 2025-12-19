import React from "react";
import { observer } from "mobx-react-lite";
import { Button, Space, Typography, Tag, Drawer } from "antd";
import {
  BugOutlined,
  SaveOutlined,
  ReloadOutlined,
  DeleteOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useStoreDebug } from "../../../../hooks";
import store from "../../../../stores/AppStore";
import { JsonView, defaultStyles, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

const { Title } = Typography;

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Debug Panel Component
 *
 * Component để debug và monitor MobX store state.
 * Hiển thị ở bottom full width khi được toggle từ navbar.
 * Only show if URL có param mode=DEBUG.
 *
 * Features:
 * - Force save state
 * - Reset state về default
 * - Review state snapshot
 * - Monitor persistence status
 * - Test persistence functionality
 */
const DebugPanel: React.FC<DebugPanelProps> = observer(
  ({ visible, onClose }) => {
    const { initialized, getStateSnapshot, forceSave, resetToDefault } =
      useStoreDebug();

    // Kiểm tra xem có param mode=DEBUG không
    const isDebugMode = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("mode") === "debug";
      }
      return false;
    };

    // Chỉ hiển thị khi có param mode=DEBUG
    if (!isDebugMode()) {
      return null;
    }

    const currentState = getStateSnapshot();
    const isDarkMode = store.state.darkMode;

    return (
      <Drawer
        title={
          <Space>
            <BugOutlined style={{ color: "#ff4d4f" }} />
            <span>Debug Panel</span>
            <Tag color={initialized ? "green" : "red"}>
              {initialized ? "Initialized" : "Loading"}
            </Tag>
          </Space>
        }
        placement="bottom"
        height="90vh"
        open={visible}
        onClose={onClose}
        closable={true}
        extra={
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        }
        styles={{
          body: { padding: "16px" },
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {/* Actions Section */}
          <div>
            <Title level={5}>🛠️ Debug Actions</Title>
            <Space wrap>
              <Button
                icon={<SaveOutlined />}
                onClick={forceSave}
                type="primary"
              >
                Force Save
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>

              <Button icon={<DeleteOutlined />} onClick={resetToDefault} danger>
                Reset All Data
              </Button>
            </Space>
          </div>
          <div
            style={{
              maxHeight: "60vh",
              overflow: "auto",
              border: "1px solid var(--ant-color-border)",
              borderRadius: 6,
              padding: 12,
              backgroundColor: "var(--ant-color-bg-layout)"
            }}
          >
            <JsonView
              data={currentState}
              shouldExpandNode={(level: number) => level <= 1} // Mở 2 levels đầu
              style={isDarkMode ? darkStyles : defaultStyles}
              clickToExpandNode={true}
            />
          </div>
        </Space>
      </Drawer>
    );
  }
);

export default DebugPanel;
