from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.1-8b-instant"
)

def summarize_note(text: str):

    prompt = ChatPromptTemplate.from_template(
        "Summarize this note in exactly 5 concise bullet points:\n{text}"
    )

    chain = prompt | llm

    response = chain.invoke({"text": text})

    return response.content