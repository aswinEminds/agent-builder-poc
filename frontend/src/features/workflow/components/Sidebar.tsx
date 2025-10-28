// Sidebar.tsx
import React, { useState } from "react";
import { type NodeConfig, getNodesByCategory } from "../const/node-config";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";

const Sidebar = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    nodeName: string,
    category: string
  ) => {
    event.dataTransfer.setData("application/reactflow/nodeType", nodeType);
    event.dataTransfer.setData("application/reactflow/nodeName", nodeName);
    event.dataTransfer.setData(
      "application/reactflow/nodeCategory",
      category || ""
    );

    event.dataTransfer.effectAllowed = "move";
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const nodesByCategory = getNodesByCategory();

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Components</h2>
      </div>

      <div className="p-2">
        {Object.entries(nodesByCategory).map(([category, nodes]) => {
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="mb-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {category}
                </span>
              </button>

              {/* Nodes in Category */}
              {isExpanded && (
                <div className="mt-1 ml-2 pl-4 space-y-1">
                  {nodes.map((node: NodeConfig, index: number) => (
                    <div
                      key={`${category}-${index}`}
                      className="group flex items-center bg-gray-100  gap-2 px-4 py-3 rounded-md cursor-grab hover:bg-gray-200 transition-colors active:cursor-grabbing"
                      draggable
                      onDragStart={(event) =>
                        onDragStart(
                          event,
                          node.nodeType,
                          node.name,
                          node.category
                        )
                      }
                    >
                      {/* Node Icon */}
                      <div className="text-gray-600 group-hover:text-gray-900 transition-colors">
                        {React.createElement(node.icon, {
                          className: "w-4 h-4",
                        })}
                      </div>

                      {/* Node Name */}
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors flex-1">
                        {node.name}
                      </span>

                      {/* Drag Icon */}
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
