import json
import copy
import re
import os
import shutil
import sys
import importlib.util
from jinja2 import Environment, FileSystemLoader, select_autoescape
from dotenv import load_dotenv

# --- FastAPI & Pydantic Imports ---
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

# --- Pydantic Models for API ---

class RunInput(BaseModel):
    """Pydantic model for the user's message to the agent."""
    message: str

# --- App Initialization ---
app = FastAPI(
    title="LangGraph Agent Generator & Runner",
    description="API to dynamically generate and run LangGraph agents."
)

# --- Agent Cache ---
# This will store compiled graphs in memory, mapped by their flow_id
graphs_cache: Dict[str, Any] = {}
BASE_PROJECT_DIR = "generated_agents"


# ----------------------------------------------------------------------
#  AGENT GENERATION LOGIC
# ----------------------------------------------------------------------

IMPORT_REGEX = re.compile(r"^\s*(import\s.+|from\s.+\simport\s.+)", re.MULTILINE)

def load_code_from_library(component_type, name):
    """
    Helper function to read code from files.
    """
    imports = []
    full_code = ""
    filepath = "" # Define filepath in outer scope
    try:
        if component_type == "tool_function":
            filepath = f"component_library/tool_functions/{name}.py"
        elif component_type == "condition":
            filepath = f"component_library/conditions/{name}.py"
        else:
            return f"# ERROR: Unknown component type '{component_type}'", []

        with open(filepath, 'r') as f:
            full_code = f.read()
            imports = IMPORT_REGEX.findall(full_code)
            
        return full_code, imports

    except FileNotFoundError:
        print(f"⚠️  Warning: Code file for '{name}' not found at {filepath}.")
        return f"# ERROR: Code for '{name}' not found.", []


def enrich_json(minimal_json):
    """
    Takes the minimal graph JSON and enriches it with code, imports,
    and a simplified graph structure.
    """
    
    complete_json = copy.deepcopy(minimal_json)
    all_tool_imports = set()
    tool_api_keys = {} 
    base_tool_code = set()
    
    # --- 1. Find all Tool Definitions and Agent IDs ---
    tool_funcs_available = []
    tool_node_ids = set() 
    agent_node_ids = set()

    for node in complete_json.get("nodes", []):
        func_name = None
        
        # --- Handle all tool types ---
        if node.get("type") == "tool_function":
            func_name = node["data"]["function_name"]
            tool_node_ids.add(node["id"])
            
            base_tool_name = node["data"].get("base_tool")
            
            if base_tool_name:
                # Dynamic API tool
                code_string, imports_list = load_code_from_library("tool_function", base_tool_name)
                all_tool_imports.update(imports_list)
                base_tool_code.add(code_string) 

                static_args = node["data"].get("static_args", {})
                static_args_str = json.dumps(static_args)
                
                llm_args_list = node["data"].get("llm_args", [
                    "params: Optional[Dict[str, Any]] = None",
                    "data: Optional[Dict[str, Any]] = None"
                ])
                llm_arg_names = [arg.split(":")[0].strip() for arg in llm_args_list]
                wrapper_signature = ", ".join(llm_args_list)

                generated_code = f"""
from typing import Optional, Dict, Any

def {func_name}({wrapper_signature}):
    \"\"\"Dynamically generated tool. Calls {base_tool_name}\"\"\"
    final_args = {static_args_str}
    if "url" in final_args:
        final_args["url"] = final_args["url"].format(
            {", ".join([f"{name}={name}" for name in llm_arg_names if name not in ['params', 'data', 'headers']])}
        )
    if "params" in {llm_arg_names} and params: final_args["params"] = params
    if "data" in {llm_arg_names} and data: final_args["data"] = data
    if "headers" in {llm_arg_names} and headers: final_args["headers"] = headers
    return api_request(**final_args)
"""
                node["data"]["code"] = generated_code
                
            else:
                # Normal tool
                code_string, imports_list = load_code_from_library("tool_function", func_name)
                node["data"]["code"] = code_string
                all_tool_imports.update(imports_list)

        elif node.get("type") == "tavily":
            # Use the function_name from the JSON.
            func_name = node["data"].get("function_name") 
            if not func_name:
                func_name = "tavily" # Fallback
                node["data"]["function_name"] = func_name # Inject for template
            
            tool_node_ids.add(node["id"])
            
            # Load 'component_library/tool_functions/tavily.py'
            code_string, imports_list = load_code_from_library("tool_function", "tavily")
            node["data"]["code"] = code_string
            all_tool_imports.update(imports_list)

        elif node.get("type") == "agent":
            agent_node_ids.add(node["id"])

        # Add API keys if present
        if "API_key" in node["data"]:
            key_name = func_name or node.get("type")
            if key_name:
                env_var_name = f"{key_name.split('_')[0].upper()}_API_KEY"
                tool_api_keys[env_var_name] = node["data"]["API_key"]
                
        # Add function to prompt list
        if func_name:
            tool_funcs_available.append(func_name)

    # ... (Step 2: Enrich Agent Nodes) ...
    for node in complete_json.get("nodes", []):
        if node.get("type") == "agent":
            prompt_tools_list = ""
            for i, tool_name in enumerate(tool_funcs_available, 1):
                prompt_tools_list += f"\\n{i}. {tool_name}()" 
            
            original_message = node["data"].get("system_message", "You are a helpful assistant.")
            system_message = (
                f"{original_message} "
                f"You have access to the following tools:\\n{prompt_tools_list}\\n"
                "You must decide which one is most appropriate."
            )
            
            node["data"]["system_message_generated"] = system_message
            node["data"]["code_logic"] = f"""
from langgraph.graph import MessagesState

def agent(state: MessagesState):
    \"\"\"Node to call the LLM.\"\"\"
    system_prompt = {{
        "role": "system",
        "content": \"\"\"{system_message}\"\"\"
    }}
    messages = [system_prompt] + state["messages"]
    response = model_with_tools.invoke(messages)
    return {{"messages": [response]}}
"""

    # --- 3. Compile Graph - Force a single "tools" node ---
    tool_executor_id = "tools"
    # Add the generic "tools" node
    complete_json["nodes"].append({
        "id": tool_executor_id,
        "type": "tool_executor", # Synthetic type for the template
        "data": {"label": "Tool Executor", "title": "Tool Executor Node"}
    })

    # Re-wire all edges
    edges_to_keep = []
    simple_edges = set()
    for edge in complete_json.get("edges", []):
        if edge["source"] in agent_node_ids and edge["target"] in tool_node_ids:
            edge["target"] = tool_executor_id
            edges_to_keep.append(edge)
        elif edge["source"] in tool_node_ids and edge["target"] in agent_node_ids:
            simple_edges.add((tool_executor_id, edge["target"]))
        elif edge["source"] in agent_node_ids and edge["target"] in agent_node_ids:
            edges_to_keep.append(edge)

    for source, target in simple_edges:
        edges_to_keep.append({
            "id": f"edge-{source}-to-{target}", "source": source,
            "target": target, "type": "simple"
        })
    complete_json["edges"] = edges_to_keep
    
    # --- 4. Enrich Metadata ---
    complete_json.setdefault("metadata", {})
    all_tool_imports.add("from langgraph.graph import END, MessagesState")
    
    default_condition_code = f"""
def should_continue(state: MessagesState):
    \"\"\"Determine whether to call tools or end.\"\"\"
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "{tool_executor_id}"
    return END
"""
    complete_json["metadata"]["function_definitions"] = []
    for edge in complete_json.get("edges", []):
        if edge.get("type") == "conditional":
            if "condition" in edge and edge["condition"]:
                condition_name = edge["condition"]
                code_string, imports_list = load_code_from_library("condition", condition_name)
                all_tool_imports.update(imports_list)
                
                return_match = re.search(r"return\s+[\"\'](\w+)[\"\']", code_string)
                if return_match:
                    placeholder = return_match.group(1)
                    code_string = code_string.replace(f'"{placeholder}"', f'"{tool_executor_id}"')
                    code_string = code_string.replace(f"'{placeholder}'", f"'{tool_executor_id}'")
            else:
                print(f"⚠️  Warning: No 'condition' found for conditional edge {edge['id']}. Using default 'should_continue'.")
                condition_name = "should_continue"
                edge["condition"] = condition_name 
                code_string = default_condition_code
            
            complete_json["metadata"]["function_definitions"].append({
                "name": condition_name, "type": "condition", "code": code_string
            })
    
    complete_json["metadata"]["imports"] = list(all_tool_imports)
    complete_json["metadata"]["tool_api_keys"] = tool_api_keys
    complete_json["metadata"]["base_tool_code_blocks"] = list(base_tool_code)
    return complete_json

def generate_agent_project(minimal_data: Dict[str, Any], flow_id: str) -> Dict[str, Any]:
    """
    Takes JSON data and a flow_id, and builds the agent project directory.
    The directory will be named after the flow_id.
    """
    global BASE_PROJECT_DIR
    output_dir = os.path.join(BASE_PROJECT_DIR, flow_id)
    logs = []

    # 1. Clean and create output dir
    try:
        if os.path.exists(output_dir):
            logs.append(f"Cleaning old directory: {output_dir}/")
            shutil.rmtree(output_dir)
        os.makedirs(output_dir)
        logs.append(f"Created new directory: {output_dir}/")
    except Exception as e:
        logs.append(f"❌ Error cleaning/creating directory: {e}")
        return {"status": "error", "logs": logs, "error": str(e)}

    # 2. Setup Jinja
    env = Environment(
        loader=FileSystemLoader('.'), # Assumes template is in the root
        autoescape=select_autoescape()
    )

    # 3. Enrich the JSON
    try:
        complete_data = enrich_json(minimal_data)
        logs.append("✅ Enriched JSON with code library.")
    except Exception as e:
        logs.append(f"❌ Error during JSON enrichment: {e}")
        return {"status": "error", "logs": logs, "error": str(e)}
    
    # 4. Copy dependencies
    try:
        if os.path.exists("llm_factory"):
            shutil.copytree("llm_factory", os.path.join(output_dir, "llm_factory"))
        if os.path.exists(".env"):
            shutil.copy(".env", os.path.join(output_dir, ".env"))
        if os.path.exists("requirement.txt"):
            shutil.copy("requirement.txt", os.path.join(output_dir, "requirements.txt"))
        logs.append("✅ Copied dependencies.")
    except Exception as e:
        logs.append(f"⚠️  Warning: Failed to copy dependencies: {e}")

    # 5. Render and Save agent.py
    try:
        template = env.get_template('langgraph_template.py.j2')
        rendered = template.render(complete_data)
        output_path = os.path.join(output_dir, "agent.py")
        
        with open(output_path, 'w', encoding='utf-8') as out:
            out.write(rendered)
        
        logs.append(f"🎉 Success! Agent file written to: {output_path}")
        
    except Exception as e:
        logs.append(f"❌ Error during template rendering: {e}")
        return {"status": "error", "logs": logs, "error": str(e)}
    
    return {"status": "success", "logs": logs, "agent_path": output_path}


# ----------------------------------------------------------------------
#  AGENT RUNNER LOGIC
# ----------------------------------------------------------------------

def load_graph(flow_id: str) -> bool:
    """
    Dynamically imports the compiled graph for a given flow_id
    from its directory (e.g., generated_agents/68fb5d0e.../agent.py)
    and stores it in the cache.
    """
    global graphs_cache
    global BASE_PROJECT_DIR
    
    agent_dir = os.path.join(BASE_PROJECT_DIR, flow_id)
    agent_path = os.path.join(agent_dir, "agent.py")
    app_dir = os.path.abspath(agent_dir)
    
    if not os.path.exists(agent_path):
        print(f"Agent file not found for flow_id {flow_id} at: {agent_path}")
        return False

    # Add the generated app dir to the Python path
    if app_dir not in sys.path:
        sys.path.insert(0, app_dir)
        
    try:
        # Load the .env file from the *agent's directory*
        env_path = os.path.join(app_dir, ".env")
        if os.path.exists(env_path):
            load_dotenv(env_path, override=True) # Override to load specific keys
            print(f"✅ Loaded .env file from {env_path}")

        # Import the module
        spec = importlib.util.spec_from_file_location(f"agent_{flow_id}", agent_path)
        if spec is None:
            print(f"Could not create module spec for {agent_path}")
            return False
            
        agent_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(agent_module)
        
        # Get the 'graph' object from the loaded module
        if hasattr(agent_module, "graph"):
            graphs_cache[flow_id] = agent_module.graph
            print(f"✅ Graph for flow_id {flow_id} loaded successfully into cache.")
            return True
        else:
            print(f"❌ 'graph' object not found in agent.py for flow_id {flow_id}")
            return False
            
    except Exception as e:
        print(f"Error loading graph {flow_id}: {e}")
        import traceback
        traceback.print_exc()
        if flow_id in graphs_cache:
            del graphs_cache[flow_id]
        return False
    finally:
        # Clean up path
        if sys.path[0] == app_dir:
            sys.path.pop(0)

# ----------------------------------------------------------------------
#  API ENDPOINTS
# ----------------------------------------------------------------------

@app.post("/generate")
def generate_agent(graph_def: Dict[str, Any]):
    """
    Endpoint 1: Receives a raw graph JSON, generates the agent project
    (named by the 'id' field), and loads the new agent into memory.
    """
    global graphs_cache
    
    flow_id = graph_def.get("id")
    if not flow_id:
        raise HTTPException(status_code=400, detail="JSON payload must have an 'id' field.")

    # Clear any old, cached version of this graph
    graphs_cache.pop(flow_id, None) 
    
    # Run the project generation logic
    result = generate_agent_project(graph_def, flow_id)
    
    if result["status"] == "success":
        # Immediately try to load the new graph
        if load_graph(flow_id):
            return {"id": flow_id, "status": "success"}
        else:
            return {
                "id": flow_id,
                "status": "error",
                "message": f"Agent {flow_id} generated but failed to load. Check server logs."
            }
    else:
        # Generation itself failed
        return {
            "id": flow_id,
            "status": "error",
            "message": result.get("error", "Generation failed. Check server logs.")
        }

@app.post("/workflows/{flow_id}/execute")
def run_agent(flow_id: str, input: RunInput):
    """
    Endpoint 2: Runs the agent specified by 'flow_id' with user input.
    """
    global graphs_cache
    
    # Get graph from cache
    compiled_graph = graphs_cache.get(flow_id)
    
    # If not in cache, try to load it
    if compiled_graph is None:
        if not load_graph(flow_id):
            raise HTTPException(
                status_code=404, 
                detail=f"Agent (flow_id: {flow_id}) not found. Please call /generate first."
            )
        compiled_graph = graphs_cache.get(flow_id) # Get it again after loading

    # --- Run the agent ---
    try:
        state = {"messages": [{"role": "user", "content": input.message}]}
        
        # Use synchronous 'invoke'
        out = compiled_graph.invoke(state)
        
        last_message = out["messages"][-1]
        response_content = getattr(last_message, "content", str(last_message))
        
        return {"response": response_content}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Error during agent invocation for {flow_id}: {str(e)}"
        )

@app.get("/")
def read_root():
    return {"message": "LangGraph Agent Generator API is running. POST to /generate or /workflows/{flow_id}/execute."}

# ----------------------------------------------------------------------
#  RUN THE SERVER
# ----------------------------------------------------------------------

if __name__ == "__main__":
    print("--- Starting FastAPI Server ---")
    # Create the base directory if it doesn't exist
    os.makedirs(BASE_PROJECT_DIR, exist_ok=True)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)