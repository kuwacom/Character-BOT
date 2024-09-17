import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# model_name = "meta-llama/Llama-2-7b-chat-hf"
model_name = "models/ELYZA-japanese-Llama-2-7b"
# model_name = "../../project/Character-BOT/models/Llama-3-ELYZA-JP-8B"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    
    device_map="auto",
    torch_dtype=torch.float16,  # メモリ使用量を減らすために float16 を使用
    # low_cpu_mem_usage=True      # CPU メモリの使用を抑えるオプション
    )

# from langchain.llms.huggingface_pipeline import HuggingFacePipeline
from langchain_huggingface import HuggingFacePipeline
from transformers import pipeline

llama_pipeline = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    # max_length=256,
    # temperature=0.7,
    # top_p=0.95,
    # repetition_penalty=1.15,
)

llm = HuggingFacePipeline(pipeline=llama_pipeline)


from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_core.prompts import ChatPromptTemplate
from langchain.prompts.chat import (
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "あなたは親切で知識豊富なアシスタントです。あなたの名前は{name}です。"),
        ("user", "こんにちは！"),
        ("ai", "こんにちは！私はサポートAIアシスタントです！\n何でも質問してください！"),
        ("user", "{user_input}"),
    ]
)

# template = """{question}"""
# prompt = ChatPromptTemplate.from_messages(
#     [
#         HumanMessagePromptTemplate.from_template(template),
#         AIMessagePromptTemplate.from_template(""),
#     ]
# )

# prompt_template = """あなたは親切で知識豊富なアシスタントです。
# 以下は会話の履歴です。
# {history}
# ユーザー: {userInput}
# ボット:"""
# prompt_template = "ユーザー: {userInput}\nAI:"
# prompt = PromptTemplate(template=prompt_template, input_variables=["history", "userInput"])
# prompt = PromptTemplate(template=prompt_template, input_variables=["userInput"])

# chain = LLMChain(llm=llm, prompt=prompt)
chain = prompt | llm

from fastapi import FastAPI
from langserve import add_routes

app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="LangchainのRunnableインターフェースを使ったシンプルなAPIサーバー",
)

add_routes(
    app,
    chain,
    path="/llama2"
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8100)