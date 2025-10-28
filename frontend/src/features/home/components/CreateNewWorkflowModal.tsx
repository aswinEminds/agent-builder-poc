import { Modal, TextFiled as TextField } from "@/shared/components/ui";
import React, { useState } from "react";

interface WorkflowFormData {
  title: string;
  description: string;
}

interface CreateNewWorkflowModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (workflowData: WorkflowFormData) => Promise<void>;
  isLoading?: boolean;
}

const CreateNewWorkflowModal: React.FC<CreateNewWorkflowModalProps> = ({
  show,
  onHide,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<WorkflowFormData>({
    title: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<WorkflowFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof WorkflowFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<WorkflowFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form on successful submission
      setFormData({
        title: "",
        description: "",
      });
      setErrors({});
      onHide(); // Close modal on success
    } catch (error) {
      console.error("Failed to create workflow:", error);
      // You can set a general error message here if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
    });
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-text-heading">
            Create New Workflow
          </h2>
          <p className="text-sm text-text-body mt-1">
            Create a new workflow to automate your processes
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Title Field */}
            <TextField
              type="text"
              id="title"
              name="title"
              label="Workflow Title"
              placeholder="Enter workflow title"
              value={formData.title}
              onChange={handleInputChange}
              error={errors.title}
              hasError={!!errors.title}
              fullWidth
              required
            />

            {/* Description Field */}
            <TextField
              type="text"
              id="description"
              name="description"
              label="Description"
              placeholder="Enter workflow description"
              value={formData.description}
              onChange={handleInputChange}
              error={errors.description}
              hasError={!!errors.description}
              fullWidth
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-text-body bg-white border border-border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-text-body bg-white border border-border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              disabled={isSubmitting || isLoading}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? "Creating..." : "Create Workflow"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateNewWorkflowModal;
    