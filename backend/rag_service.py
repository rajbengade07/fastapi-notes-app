from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.1-8b-instant"
)

def rag_answer(query: str, collection):

    # --------------------------
    # STEP 1: RETRIEVE DATA
    # --------------------------
    notes = collection.find()

    context = ""

    for note in notes:
        if query.lower() in note["title"].lower() or query.lower() in note["description"].lower():
            context += f"Title: {note['title']}\nDescription: {note['description']}\n\n"

    if not context:
        context = "No relevant notes found."

    # --------------------------
    # STEP 2: LLM RESPONSE
    # --------------------------
    prompt = ChatPromptTemplate.from_template(
        """
        Summarize this note in exactly 5 concise bullet points.

Keep each point under 15 words.


        Context:
        {context}

        Question:
        {question}
        """
    )

    chain = prompt | llm

    response = chain.invoke({
        "context": context,
        "question": query
    })

    return response.content