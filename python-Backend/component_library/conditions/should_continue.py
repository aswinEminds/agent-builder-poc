def should_continue(state: MessagesState):
    """Determine whether to call tools or end."""
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END