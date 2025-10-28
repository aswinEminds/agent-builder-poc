import os
from langchain_openai import ChatOpenAI, AzureChatOpenAI
from langchain_groq import ChatGroq

def init_chat_model(**kwargs):
    """
    Factory function to initialize a chat model based on the provider.
    Sets the appropriate environment variables for the model to auto-detect.
    """
    
    provider = kwargs.get("provider")
    model_name = kwargs.get("model")
    api_key = kwargs.get("API_key")

    if not provider:
        raise ValueError("LLM node 'data' must include a 'provider' field.")

    if provider == "OpenAI":
        # Set the environment variable for OpenAI
        os.environ["OPENAI_API_KEY"] = api_key
        return ChatOpenAI(
            model=model_name,
            temperature=0
            # Client will auto-read "OPENAI_API_KEY"
        )
        
    elif provider == "Groq":
        # Set the environment variable for Groq
        os.environ["GROQ_API_KEY"] = api_key
        return ChatGroq(
            model=model_name,
            temperature=0
            # Client will auto-read "GROQ_API_KEY"
        )
        
    elif provider == "Azure":
        api_version = kwargs.get("API_Version")
        azure_endpoint = kwargs.get("Azure_Endpoint")
        
        if not all([api_version, azure_endpoint]):
            raise ValueError("Azure provider requires 'API_Version' and 'Azure_Endpoint'.")

        # Set environment variables for the Azure client
        os.environ["AZURE_OPENAI_API_KEY"] = api_key
        os.environ["AZURE_OPENAI_ENDPOINT"] = azure_endpoint
        os.environ["OPENAI_API_VERSION"] = api_version
            
        return AzureChatOpenAI(
            model=model_name,
            temperature=0
            # Client will auto-read the AZURE_... variables
        )
        
    else:
        raise ValueError(f"Unsupported provider: '{provider}'. Supported: OpenAI, Azure, Groq")