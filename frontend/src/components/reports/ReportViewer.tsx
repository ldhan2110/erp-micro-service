import React, { useState } from "react";
import { Modal, Spin, message, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { getApiUrl } from "../../configs/api";

interface ReportViewerProps {
  endpoint: string;
  title?: string;
  filename?: string;
  visible: boolean;
  onClose: () => void;
  showDownloadButton?: boolean;
  parameters?: Record<string, unknown>;
}

const ReportViewer: React.FC<ReportViewerProps> = ({
  endpoint,
  title = "Report Viewer",
  filename = "report.pdf",
  visible,
  onClose,
  showDownloadButton = true,
  parameters = {},
}) => {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(getApiUrl(endpoint), {
        responseType: "blob",
        params: parameters,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Create blob URL for viewing
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error: unknown) {
      console.error("Error generating report:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      message.error(`Failed to generate report: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleModalOpen = () => {
    if (!pdfUrl) {
      generateReport();
    }
  };

  const handleModalClose = () => {
    // Clean up blob URL when modal closes
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    onClose();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleModalClose}
      onOk={handleModalClose}
      width="90%"
      style={{ top: 20 }}
      footer={[
        showDownloadButton && (
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={!pdfUrl}
          >
            Download
          </Button>
        ),
        <Button key="close" onClick={handleModalClose}>
          Close
        </Button>,
      ].filter(Boolean)}
      afterOpenChange={handleModalOpen}
    >
      <div
        style={{
          height: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Generating report...</div>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="Report Viewer"
          />
        ) : (
          <div style={{ textAlign: "center", color: "#999" }}>
            Click to generate report
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReportViewer;
