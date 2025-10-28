

# Dynamic LangGraph Agent Service

This project is a FastAPI server that dynamically generates and serves multi-tool LangGraph agents from a single JSON definition.

It turns a JSON blueprint, defining nodes and edges, into a live, executable API endpoint. It reads your custom tools from a `component_library`, generates a complete Python agent project, and serves it via a simple REST API.

## Features

  * **Dynamic Agent Generation:** Define complex agents (LLMs, tools, logic) in a simple JSON format.
  * **Live API Endpoints:** Instantly creates a new API endpoint (`/workflows/{flow_id}/execute`) for each agent you generate.
  * **Component-Based:** Pulls tool definitions (`.py` files) from a `component_library`, making tools reusable and easy to manage.
  * **Simplified Graph Logic:** Automatically "flattens" any graph into a standard, robust `Agent -> tools -> Agent` flow.
  * **Multi-Agent Ready:** Each generated agent is isolated in its own project directory (`generated_agents/{flow_id}`), with its own dependencies and environment variables.
  * **In-Memory Caching:** Caches compiled agent graphs in memory (`graphs_cache`) for high-performance execution, only loading from disk when necessary.

## Project Structure

Your project **must** follow this structure for the server to work.

```
.
├── component_library/
│   ├── tool_functions/
│   │   ├── tavily.py
│   │   └── get_stock_info.py
│   └── conditions/
│       └── should_continue.py
│
├── llm_factory/
│   └── chat_models.py
│
├── generated_agents/           <-- (This is created automatically)
│   └── {flow_id}/
│       ├── agent.py            <-- (This is generated)
│       ├── llm_factory/        (Copied)
│       └── .env                (Copied)
│
├── main.py                     <-- (The FastAPI Server)
├── langgraph_template.py.j2    <-- (The Agent Template)
├── .env                        (Your main .env file)
└── requirement.txt
```

## Setup & Installation

1.  **Dependencies:** Install all required Python packages.

    ```bash
    pip install fastapi "uvicorn[standard]" pydantic python-dotenv jinja2
    pip install langgraph langchain langchain_openai langchain_groq
    # ... any other libraries your tools need (e.g., httpx, yfinance)
    ```

2.  **Create `.env` File:** Create a `.env` file in the project's root directory. The service will copy this file into each new agent's folder.

    ```.env
    GROQ_API_KEY=gsk_...
    TAVILY_API_KEY=tvly-...
    # Add any other keys your tools or LLMs need
    ```

3.  **Populate `component_library`:** Add your Python files for tools (like `tavily.py`) into the `component_library/tool_functions/` directory.

4.  **Run the Server:**

    ```bash
    python main.py
    ```

    The server will start on `http://0.0.0.0:8000`.

-----

## API Endpoints

The service provides two primary endpoints to manage and run your agents.

### 1\. Generate an Agent

This endpoint creates or updates an agent. It generates the `agent.py` file based on your JSON, creates the agent's project folder, and loads the compiled agent into the server's memory cache.

  * **URL:** `POST /generate`

  * **Request Body:** Send the **raw** graph definition JSON as the request body. This JSON *must* contain a top-level `"id"` field, which will be used as the agent's unique `flow_id`.

    **Example Request Body (`POST /generate`):**

    ```json
    {
      "id": "68fb5d0e35693c0c229fdd8a",
      "title": "Tavily-Agent",
      "metadata": { ... },
      "nodes": [
        {
          "id": "agent-176...",
          "type": "agent",
          "data": { "provider": "Groq", "model": "...", ... }
        },
        {
          "id": "tavily-176...",
          "type": "tavily",
          "data": { "API_key": "tvly-...", "function_name": "tavily" }
        }
      ],
      "edges": [ ... ]
    }
    ```

  * **Success Response (200 OK):**

    ```json
    {
      "id": "68fb5d0e35693c0c229fdd8a",
      "status": "success"
    }
    ```

  * **Failure Response (500 Internal Server Error):**

    ```json
    {
      "id": "68fb5d0e35693c0c229fdd8a",
      "status": "error",
      "message": "Agent 68fb... generated but failed to load. Check server logs."
    }
    ```

### 2\. Execute an Agent

This endpoint runs a previously generated agent.

  * **URL:** `POST /workflows/{flow_id}/execute`

  * **URL Parameter:** `{flow_id}` is the unique `"id"` of the agent you want to run (e.g., `68fb5d0e35693c0c229fdd8a`).

  * **Request Body:** A simple JSON object with a `"message"` key.

    **Example Request Body (`POST /workflows/68fb.../execute`):**

    ```json
    {
      "message": "What is the capital of France?"
    }
    ```

  * **Success Response (200 OK):**

    ```json
    {
      "response": "The capital of France is Paris."
    }
    ```

  * **Failure Responses:**

      * `404 Not Found`: If no agent with that `flow_id` has been generated or can be found.
      * `500 Internal Server Error`: If the agent itself crashes during execution.

-----

## How It Works (Internal Logic)

  * **`enrich_json(minimal_json)`:** This is the core "translation" engine. It reads the input JSON and:

    1.  Loads the Python code for all tools (e.g., `tavily`, `tool_function`) from the `component_library`.
    2.  Generates the Python code for the `agent` node, including a dynamic system prompt listing all available tools.
    3.  **Flattens the graph:** It finds all tool nodes and rewires all edges to point to a single, synthetic `tool_executor` node (which it names `"tools"`). This ensures all generated agents follow a simple, robust `Agent -> tools -> Agent` pattern.
    4.  Generates a default `should_continue` condition function that routes to `"tools"` if the agent called a tool, or to `END` if it did not.
    5.  Bundles all code, imports, and API keys for the Jinja2 template.

  * **`load_graph(flow_id)`:** This function is responsible for loading a generated agent into memory.

    1.  It dynamically imports the `agent.py` file from its specific directory (e.g., `generated_agents/68fb.../agent.py`).
    2.  It loads the `.env` file *from that directory* to set the correct API keys for that specific agent.
    3.  It finds the compiled `graph` object inside the imported module.
    4.  It stores this `graph` object in the global `graphs_cache` dictionary.

  * **`graphs_cache`:** This global dictionary is the key to the service's performance.

      * When you call `/execute`, it first checks this cache.
      * If the agent is present, it executes it immediately (very fast).
      * If the agent is *not* present (e.g., after a server restart), it calls `load_graph` just once to load it from disk and add it to the cache.