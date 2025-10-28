import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody } from "@/shared/components/ui";
import { Copy, Check, Code, Globe, FileText } from "lucide-react";
import { toast } from "react-toastify";

interface ApiAccessModalProps {
  show: boolean;
  onHide: () => void;
  workflowId: string;
}

const ApiAccessModal: React.FC<ApiAccessModalProps> = ({
  show,
  onHide,
  workflowId,
}) => {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8004/api";
  const apiEndpoint = `${baseUrl}/workflows/${workflowId}/execute`;

  const samplePayload = {
    input: "sample input",
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);

      if (type === "endpoint") {
        setCopiedEndpoint(true);
        setTimeout(() => setCopiedEndpoint(false), 2000);
      } else if (type === "payload") {
        setCopiedPayload(true);
        setTimeout(() => setCopiedPayload(false), 2000);
      }

      toast.success("Copied to clipboard!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" closeOnBackdrop={false}>
      <ModalHeader onClose={onHide} className="border-b border-gray-300">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-black" />
          <span className="text-base font-medium text-black">API Access</span>
        </div>
      </ModalHeader>

      <ModalBody
        className="p-0 overflow-y-auto"
        style={{ height: "50vh", maxHeight: "400px" }}
      >
        <div className="p-6 space-y-6">
          {/* API Endpoint Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-black" />
              <h3 className="text-sm font-semibold text-black">API Endpoint</h3>
            </div>
            <div className="flex items-start gap-2 p-3 bg-gray-100 border border-gray-300 rounded-lg">
              <span className="px-2 py-1 text-xs font-medium text-black bg-white border border-gray-300 rounded flex-shrink-0">
                POST
              </span>
              <div className="flex-1 min-w-0">
                <code className="block text-sm font-mono text-black break-all">
                  {apiEndpoint}
                </code>
              </div>
              <button
                onClick={() => copyToClipboard(apiEndpoint, "endpoint")}
                className="flex items-center gap-1 px-2 py-1 text-xs text-black hover:bg-gray-200 border border-gray-300 rounded transition-colors flex-shrink-0"
              >
                {copiedEndpoint ? (
                  <Check className="w-3 h-3 text-black" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copiedEndpoint ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Sample Payload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-black" />
                <h3 className="text-sm font-semibold text-black">
                  Sample Payload
                </h3>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(samplePayload, null, 2),
                    "payload"
                  )
                }
                className="flex items-center gap-1 px-2 py-1 text-xs text-black hover:bg-gray-100 border border-gray-300 rounded transition-colors"
              >
                {copiedPayload ? (
                  <Check className="w-3 h-3 text-black" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copiedPayload ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg overflow-x-auto">
              <pre className="text-xs font-mono text-black">
                {JSON.stringify(samplePayload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ApiAccessModal;
